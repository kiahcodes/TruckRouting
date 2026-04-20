# Vehicle Routing - Full Stack Application

A complete vehicle routing optimization system with React frontend, FastAPI backend, PostgreSQL database, and OSRM routing engine for managing truck deliveries and optimizing delivery routes.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [⚡ Run Commands](#-run-commands)
- [Detailed Setup](#-detailed-setup)
  - [OSRM Setup (Ahmedabad Region)](#-osrm-setup-ahmedabad-region)
  - [Frontend Setup](#-frontend-setup)
  - [Backend Setup](#-backend-setup)
  - [Database Setup](#️-database-setup)
- [API Documentation](#-api-documentation)
- [Features](#-features)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

Vehicle Routing is a logistics management application that helps businesses optimize their delivery routes. It features:

- **User Authentication**: Secure signup and login
- **Customer Management**: Add and manage customer locations
- **Warehouse Management**: Define distribution centers
- **Fleet Management**: Track trucks and vehicles
- **Route Optimization**: Intelligent route planning using Google OR-Tools + OSRM real road distances
- **Interactive Maps**: Visualize routes and locations on Leaflet maps
- **Route History**: Track completed and in-progress deliveries

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** — UI library
- **Vite 6.3.5** — Build tool
- **Leaflet 1.9.4** + **React-Leaflet 5.0.0** — Interactive maps
- **Axios 1.7.7** — HTTP client
- **React Hook Form 7.57.0** — Form management
- **React Router DOM 7.6.2** — Client-side routing

### Backend
- **FastAPI** — Modern Python web framework
- **SQLAlchemy 2.0+** — ORM for database operations
- **asyncpg** — Async PostgreSQL driver
- **Pydantic** — Data validation
- **Google OR-Tools** — Route optimization engine
- **scikit-learn** — KMeans clustering for customer grouping
- **Pandas & NumPy** — Data processing

### Database
- **PostgreSQL 12+** — Relational database
- **Async drivers** — Non-blocking database operations

### Routing Engine
- **OSRM (Open Source Routing Machine)** — Real-world road distance and time matrix
- **OpenStreetMap data** — Gujarat/Ahmedabad region map data

---

## 📁 Project Structure

```
VehicleRoutingReactFastAPI/
├── README.md                          # This file
├── frontend/                          # React application
│   ├── src/
│   │   ├── Components/               # React components
│   │   │   ├── Header.jsx            # Navigation
│   │   │   ├── LoginForm.jsx         # Authentication
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── DataEntry.jsx         # Customer/warehouse entry
│   │   │   ├── RoutesPlanning.jsx    # Route creation
│   │   │   ├── Map.jsx               # Interactive maps
│   │   │   └── ViewRoutes.jsx        # Route visualization
│   │   ├── Api.jsx                   # API service layer
│   │   ├── App.jsx                   # Root component
│   │   └── main.jsx                  # Entry point
│   ├── package.json                  # Dependencies
│   ├── vite.config.js                # Vite configuration
│   └── index.html                    # HTML template
│
├── backend/                           # FastAPI application
│   ├── main.py                       # API routes & setup
│   ├── models.py                     # SQLAlchemy models
│   ├── schemas.py                    # Pydantic schemas
│   ├── database.py                   # Database config
│   └── requirements.txt              # Python dependencies
```

---

## ⚡ Run Commands

All services must be running simultaneously. Open separate terminal windows for each.

### 🗺️ OSRM — Routing Engine

```bash
cd ~/osrm-backend/build
./osrm-routed ~/osrm-data/ahmedabad-latest.osrm --port 5000
```

> OSRM must be started **before** the backend. The route optimization API calls `http://localhost:5000` internally.

---

### 🗄️ Database — PostgreSQL

```bash
# Start PostgreSQL service (if not already running)
sudo systemctl start postgresql

# One-time: Create database and user
sudo -u postgres psql -c "CREATE DATABASE customers;"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE customers TO postgres;"
```

---

### ⚙️ Backend — FastAPI

```bash
cd backend
pip install -r requirements.txt    # first time only
uvicorn main:app --reload
```

> Runs on `http://localhost:8000`

---

### 🌐 Frontend — React + Vite

```bash
cd frontend
npm install        # first time only
npm run dev
```

> Runs on `http://localhost:5173`

---

### 🔗 Access Points

| Service        | URL                           |
|----------------|-------------------------------|
| Application    | http://localhost:5173         |
| API Docs       | http://localhost:8000/docs    |
| OSRM Engine    | http://localhost:5000         |

---

## 📖 Detailed Setup

---

### 🗺️ OSRM Setup (Ahmedabad Region)

OSRM is used to compute real road distance matrices between customers and the warehouse. The backend calls OSRM's `/table/v1/driving/` API internally during route optimization.

#### Step 1 — Install Dependencies

```bash
sudo apt-get update
sudo apt-get install -y build-essential git cmake pkg-config \
  libbz2-dev libxml2-dev libzip-dev libboost-all-dev \
  lua5.2 liblua5.2-dev libtbb-dev
```

#### Step 2 — Build OSRM from Source

```bash
git clone https://github.com/Project-OSRM/osrm-backend.git ~/osrm-backend
cd ~/osrm-backend
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --parallel $(nproc)
```

#### Step 3 — Download Ahmedabad / Gujarat OSM Data

Download the Gujarat state extract (which includes Ahmedabad) from Geofabrik:

```bash
mkdir -p ~/osrm-data
cd ~/osrm-data

# Gujarat state extract (includes Ahmedabad)
wget https://download.geofabrik.de/asia/india/gujarat-latest.osm.pbf
```

> **Alternative**: If you want a smaller, Ahmedabad-city-only extract, use a custom clip with `osmium` (see Step 3b below).

#### Step 3b — (Optional) Clip to Ahmedabad City Only

For a smaller and faster file, clip the Gujarat data to Ahmedabad's bounding box:

```bash
# Install osmium
sudo apt-get install -y osmium-tool

# Clip to Ahmedabad bounding box (lon_min,lat_min,lon_max,lat_max)
osmium extract \
  --bbox 72.4,22.9,72.8,23.2 \
  ~/osrm-data/gujarat-latest.osm.pbf \
  --output ~/osrm-data/ahmedabad-latest.osm.pbf
```

#### Step 4 — Pre-process Map Data

OSRM requires preprocessing the `.osm.pbf` file before routing:

```bash
cd ~/osrm-data

# Extract road network using car profile
~/osrm-backend/build/osrm-extract \
  -p ~/osrm-backend/profiles/car.lua \
  ahmedabad-latest.osm.pbf

# Partition and customize for MLD algorithm
~/osrm-backend/build/osrm-partition ahmedabad-latest.osrm
~/osrm-backend/build/osrm-customize ahmedabad-latest.osrm
```

> **Note**: The `.osrm` file is generated from `.osm.pbf`. This step only needs to be done once (or when you update the map data).

#### Step 5 — Run OSRM Server

```bash
cd ~/osrm-backend/build
./osrm-routed ~/osrm-data/ahmedabad-latest.osrm --port 5000
```

OSRM will be available at `http://localhost:5000`

#### Step 6 — Verify OSRM is Working

Test with a sample coordinate query (Ahmedabad coordinates):

```bash
curl "http://localhost:5000/route/v1/driving/72.5714,23.0225;72.5800,23.0300?overview=false"
```

Expected response:

```json
{
  "code": "Ok",
  "routes": [{ "distance": ..., "duration": ... }]
}
```

#### How OSRM Integrates with the Backend

The backend uses OSRM's **Table API** to get a full distance matrix between all stops:

```python
# From backend/main.py
url = f"http://localhost:5000/table/v1/driving/{coordinates}?annotations=distance"
response = requests.get(url)
data = response.json()
distance_matrix = data["distances"]
```

This distance matrix is then fed into **Google OR-Tools** for optimal route computation.

#### OSRM Troubleshooting

| Issue | Fix |
|-------|-----|
| `OSRM error` from backend | Make sure OSRM is running on port 5000 before starting backend |
| `Connection refused` at localhost:5000 | Run the `osrm-routed` command and check for errors |
| OSM file not found | Verify the path `~/osrm-data/ahmedabad-latest.osrm` exists and preprocessing was done |
| Slow preprocessing | Use `--threads $(nproc)` flag during `osrm-extract` |
| Wrong region routes | Make sure you downloaded or clipped the correct bounding box for Ahmedabad |

---

### 🌐 Frontend Setup

#### Installation

```bash
cd frontend
npm install
```

#### Development Server

```bash
npm run dev
```

Starts Vite with hot module replacement at `http://localhost:5173`

#### Build for Production

```bash
npm run build
```

Creates optimized build in `dist/` directory

#### API Configuration

Edit `frontend/src/Api.jsx` to change backend URL:

```javascript
const API_URL = "http://localhost:8000";
```

#### Components

| Component      | Purpose                      |
|----------------|------------------------------|
| Header         | Navigation and user menu     |
| LoginForm      | User authentication          |
| Dashboard      | Main overview page           |
| DataEntry      | Add customers/warehouses     |
| RoutesPlanning | Create optimized routes      |
| Map            | Interactive location display |
| ViewRoutes     | Display planned routes       |

---

### ⚙️ Backend Setup

#### Installation

```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration

Edit `backend/database.py`:

```python
DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5432/customers"
```

Update credentials as needed:
- `postgres` — username
- `password` — user password
- `localhost` — database host
- `5432` — database port
- `customers` — database name

#### Start Development Server

```bash
cd backend
uvicorn main:app --reload
```

Server runs on `http://localhost:8000`

#### Authentication

- Passwords hashed with bcrypt
- CORS enabled for frontend (`http://localhost:5173`)
- JWT support available

---

### 🗄️ Database Setup

#### Install PostgreSQL

**Ubuntu/Debian**

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS (Homebrew)**

```bash
brew install postgresql
brew services start postgresql
```

**Windows**

Download and run installer from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE customers;
CREATE USER postgres WITH PASSWORD 'password';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE customers TO postgres;
\q
```

#### Database Schema

```sql
CREATE TABLE "user" (
    uid SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL
);

CREATE TABLE customers (
    cid VARCHAR PRIMARY KEY,
    uid INTEGER REFERENCES "user"(uid),
    business_name VARCHAR,
    latitude FLOAT,
    longitude FLOAT,
    google_map_link VARCHAR
);

CREATE TABLE warehouse (
    wid SERIAL PRIMARY KEY,
    uid INTEGER REFERENCES "user"(uid),
    name VARCHAR,
    latitude FLOAT,
    longitude FLOAT
);

CREATE TABLE truck (
    tid SERIAL PRIMARY KEY,
    uid INTEGER REFERENCES "user"(uid)
);

CREATE TABLE routes (
    rid SERIAL PRIMARY KEY,
    uid INTEGER REFERENCES "user"(uid),
    tid INTEGER REFERENCES truck(tid),
    route_sequence TEXT,
    distance FLOAT,
    estimated_time FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE route_customer (
    rid INTEGER REFERENCES routes(rid) ON DELETE CASCADE,
    cid VARCHAR REFERENCES customers(cid) ON DELETE CASCADE,
    sequence_order INTEGER,
    PRIMARY KEY (rid, cid)
);
```

#### Connection Strings

```
postgresql://postgres:password@localhost:5432/customers
postgresql+asyncpg://postgres:password@localhost:5432/customers  (async)
```

#### Backup & Restore

```bash
# Full backup
pg_dump -U postgres customers > customers_backup.sql

# Compressed backup
pg_dump -U postgres customers | gzip > customers_backup.sql.gz

# Restore from SQL file
psql -U postgres customers < customers_backup.sql

# Restore from compressed
gunzip -c customers_backup.sql.gz | psql -U postgres customers
```

---

## 📚 API Documentation

### Interactive API Docs

Once backend is running, visit:

- **Swagger UI**: http://localhost:8000/docs

### Endpoints

**Authentication**
- `POST /signup/` — Register new user
- `POST /login/` — User login

**Customer Management**
- `GET /customers/` — List all customers
- `POST /customer_add/` — Create customer
- `PUT /customer_edit/{cid}` — Update customer
- `DELETE /customer_delete/{cid}` — Delete customer

**Warehouse Management**
- `POST /warehouse/` — Create warehouse

**Route Optimization**
- `GET /routePlan/?uid={uid}` — Generate optimized routes using OSRM + OR-Tools

### Example Requests

#### Sign Up

```bash
curl -X POST http://localhost:8000/signup/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"pass123","cpassword":"pass123"}'
```

#### Optimize Routes

```bash
curl -X GET "http://localhost:8000/routePlan/?uid=1"
```

---

## ✨ Features

### Route Optimization

- KMeans clustering groups customers into truck-wise zones
- OR-Tools finds the optimal visit order per cluster
- OSRM provides real road distances (not straight-line approximations)
- Multi-truck support with 2 clusters by default

### User Management

- Secure authentication with bcrypt password hashing
- User-specific data isolation (each user sees only their data)

### Geolocation Features

- Interactive maps with Leaflet
- Customer and warehouse location display
- Google Maps link support for customers
- Real-time location updates

### Data Management

- CSV import for batch customer/warehouse entry
- Comprehensive customer database
- Route history tracking

### Performance

- Async database operations with asyncpg
- Non-blocking HTTP requests to OSRM
- Efficient SQLAlchemy queries

---
