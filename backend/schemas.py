from pydantic import BaseModel, EmailStr
from typing import Optional, List

# ---------- USER SCHEMAS ----------
class SignUpModel(BaseModel):
    username: str
    email: EmailStr
    password: str
    cpassword: str

class LoginModel(BaseModel):
    username: str
    password: str

    model_config = {
    "from_attributes": True
}



# ---------- CUSTOMER SCHEMAS ----------
class CustomerCreate(BaseModel):
    cid: str                          # C001, C002...
    uid: int
    business_name: str
    latitude: float
    longitude: float
    google_map_link: str

class CustomerUpdate(CustomerCreate):
    pass
class CustomerRead(CustomerCreate):
    cid: str
    uid: int

    model_config = {
    "from_attributes": True
}

class WarehouseCreate(BaseModel):
    uid: int
    name: str
    latitude: float
    longitude: float
    model_config = {
    "from_attributes": True
}


# ---------- TRUCK SCHEMAS ----------
class TruckCreate(BaseModel):
    uid: int

class TruckOut(BaseModel):
    tid: int
    uid: int

    model_config = {
    "from_attributes": True
}



# ---------- ROUTE SCHEMAS ----------
class RouteBase(BaseModel):
    tid: Optional[int]

class RouteCreate(RouteBase):
    route_date: str  # ISO format date

class RouteOut(RouteBase):
    rid: int
    route_date: str

    model_config = {
    "from_attributes": True
}



# ---------- ROUTE_CUSTOMERS SCHEMAS ----------
class RouteCustomerCreate(BaseModel):
    rid: int
    cid: int
    sequence: int

class RouteCustomerOut(BaseModel):
    id: int
    rid: int
    cid: int
    sequence: int

    model_config = {
    "from_attributes": True
}

