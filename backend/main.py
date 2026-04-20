from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext

from models import User, Customer, Warehouse
from schemas import SignUpModel, LoginModel, CustomerCreate, CustomerUpdate, CustomerRead,WarehouseCreate
from database import get_db

from database import engine
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import requests
from ortools.constraint_solver import pywrapcp, routing_enums_pb2


app = FastAPI()

# @app.on_event("startup")
# async def on_startup():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ------------------------------------
# 🔐 Auth Routes
# ------------------------------------

@app.post("/signup/")
async def sign_up(user: SignUpModel, db: AsyncSession = Depends(get_db)):
    if user.password != user.cpassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    result = await db.execute(select(User).where(User.username == user.username))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = pwd_context.hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {"message": "User registered successfully", "uid": new_user.uid}

@app.post("/login/")
async def sign_in(user: LoginModel, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user.username))
    db_user = result.scalar_one_or_none()

    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"message": "Login successful", "uid": db_user.uid}


# ------------------------------------
# Customer 
# ------------------------------------

@app.post("/customer_add/", response_model=CustomerRead)
async def add_customer(customer: CustomerCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.uid == customer.uid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(
    select(Customer).where(Customer.cid == customer.cid, Customer.uid == customer.uid)

    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Customer ID already exists for this user")


    new_customer = Customer(
        cid=customer.cid,
        uid=customer.uid,
        business_name=customer.business_name,
        latitude=customer.latitude,
        longitude=customer.longitude,
        google_map_link=customer.google_map_link
    )

    db.add(new_customer)
    await db.commit()
    await db.refresh(new_customer)
    return new_customer

@app.get("/customers/", response_model=list[CustomerRead])
async def get_customers(
    uid: int = Query(...),  # required query param
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Customer).where(Customer.uid == uid))
    return result.scalars().all()

@app.delete("/customer_delete/{cid}", response_model=dict)
async def delete_customer(cid: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Customer).where(Customer.cid == cid))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    await db.delete(customer)
    await db.commit()
    return {"success": True, "message": f"Customer {cid} deleted"}

@app.put("/customer_edit/{cid}", response_model=CustomerRead)
async def update_customer(cid: str, updated_data: CustomerUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Customer).where(Customer.cid == cid))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for key, value in updated_data.dict().items():
        setattr(customer, key, value)

    await db.commit()
    await db.refresh(customer)
    return customer

@app.post("/warehouse/")
async def add_warehouse(data: WarehouseCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Warehouse).where(Warehouse.uid == data.uid))
    if result.scalar_one_or_none():
        return {"error": "Warehouse already exists for this user."}

    warehouse = Warehouse(**data.dict())
    db.add(warehouse)
    await db.commit()
    await db.refresh(warehouse)
    return {"message": "Warehouse saved"}

# routes

@app.get("/routePlan/")
async def route_plan(uid: int, db: AsyncSession = Depends(get_db)):
    # 1. Fetch customers for this user
    result = await db.execute(select(Customer).where(Customer.uid == uid))
    customers = result.scalars().all()
    if not customers:
        raise HTTPException(status_code=404, detail="No customers found.")

    df = pd.DataFrame([{
        "cusid": c.cid,
        "business_name": c.business_name,
        "latitude": c.latitude,
        "longitude": c.longitude
    } for c in customers])

    if df.empty:
        raise HTTPException(status_code=400, detail="Customer data is empty.")

    # 2. Fetch warehouse for this user
    result = await db.execute(select(Warehouse).where(Warehouse.uid == uid))
    warehouse = result.scalar_one_or_none()
    if not warehouse:
        raise HTTPException(status_code=404, detail="No warehouse found. Please add it first.")

    warehouse_lat = warehouse.latitude
    warehouse_lon = warehouse.longitude

    # 3. Clustering
    coords = df[['latitude', 'longitude']].values
    kmeans = KMeans(n_clusters=2, random_state=0)
    df['cluster'] = kmeans.fit_predict(coords)

    routes = []

    for cluster_id in range(2):
        cluster_df = df[df['cluster'] == cluster_id].reset_index(drop=True)

        def create_data_model():
            customer_coords = list(zip(cluster_df['longitude'], cluster_df['latitude']))
            all_coords = [(warehouse_lon, warehouse_lat)] + customer_coords
            coordinates = ';'.join([f"{lon},{lat}" for lon, lat in all_coords])

            url = f"http://localhost:5000/table/v1/driving/{coordinates}?annotations=distance"
            response = requests.get(url)
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="OSRM error")
            data = response.json()
            return {
                "distance_matrix": data["distances"],
                "num_vehicles": 1,
                "depot": 0
            }

        def solve():
            data = create_data_model()
            manager = pywrapcp.RoutingIndexManager(len(data["distance_matrix"]), 1, 0)
            routing = pywrapcp.RoutingModel(manager)

            def distance_callback(from_index, to_index):
                from_node = manager.IndexToNode(from_index)
                to_node = manager.IndexToNode(to_index)
                return int(data["distance_matrix"][from_node][to_node])

            transit_cb_index = routing.RegisterTransitCallback(distance_callback)
            routing.SetArcCostEvaluatorOfAllVehicles(transit_cb_index)

            search_params = pywrapcp.DefaultRoutingSearchParameters()
            search_params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC

            solution = routing.SolveWithParameters(search_params)
            if not solution:
                return {"error": "No solution"}

            route = []
            total_distance = 0
            index = routing.Start(0)

            while not routing.IsEnd(index):
                node = manager.IndexToNode(index)
                if node == 0:
                    step = {
                        "type": "warehouse",
                        "latitude": warehouse_lat,
                        "longitude": warehouse_lon
                    }
                else:
                    cust = cluster_df.iloc[node - 1]
                    step = {
                        "type": "customer",
                        "cusid": cust["cusid"],
                        "business_name": cust["business_name"],
                        "latitude": cust["latitude"],
                        "longitude": cust["longitude"]
                    }
                route.append(step)
                prev_index = index
                index = solution.Value(routing.NextVar(index))
                total_distance += routing.GetArcCostForVehicle(prev_index, index, 0)

            # Add return to warehouse
            route.append({
                "type": "warehouse",
                "latitude": warehouse_lat,
                "longitude": warehouse_lon
            })

            return {
                "route": route,
                "total_distance": total_distance
            }

        result = solve()
        result["truck_id"] = cluster_id + 1
        routes.append(result)

    return {"routes": routes}