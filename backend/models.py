from sqlalchemy import ForeignKey, Integer, String, Float, Date, Column
from sqlalchemy.orm import relationship, Mapped, mapped_column
from database import Base
from sqlalchemy import PrimaryKeyConstraint


# --------------------- User Table ---------------------
class User(Base):
    __tablename__ = "user"

    uid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)

    # Relationships
    trucks: Mapped[list["Truck"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    customers: Mapped[list["Customer"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    warehouse = relationship("Warehouse", back_populates="user", uselist=False)

# --------------------- Customers Table ---------------------
class Customer(Base):
    __tablename__ = "customers"

    cid: Mapped[str] = mapped_column(String, primary_key=True)
    uid: Mapped[int] = mapped_column(ForeignKey("user.uid"), nullable=False)
    business_name: Mapped[str] = mapped_column(String)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    google_map_link: Mapped[str] = mapped_column(String)

    owner: Mapped["User"] = relationship(back_populates="customers")
    route_customers: Mapped[list["RouteCustomer"]] = relationship(back_populates="customer", cascade="all, delete-orphan")


class Warehouse(Base):
    __tablename__ = "warehouse"

    wid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uid: Mapped[int] = mapped_column(ForeignKey("user.uid"))
    name: Mapped[str] = mapped_column(String)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)

    user = relationship("User", back_populates="warehouse")
# --------------------- Truck Table ---------------------
class Truck(Base):
    __tablename__ = "truck"

    tid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uid: Mapped[int] = mapped_column(ForeignKey("user.uid"), nullable=False)

    owner: Mapped["User"] = relationship(back_populates="trucks")
    routes: Mapped[list["Route"]] = relationship(back_populates="truck", cascade="all, delete-orphan")


# --------------------- Routes Table ---------------------
class Route(Base):
    __tablename__ = "routes"

    rid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tid: Mapped[int] = mapped_column(ForeignKey("truck.tid"), nullable=True)
    route_date: Mapped[Date] = mapped_column(Date, nullable=True)

    truck: Mapped["Truck"] = relationship(back_populates="routes")
    route_customers: Mapped[list["RouteCustomer"]] = relationship(back_populates="route", cascade="all, delete-orphan")


# --------------------- RouteCustomers Table ---------------------
class RouteCustomer(Base):
    __tablename__ = "route_customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rid: Mapped[int] = mapped_column(ForeignKey("routes.rid"), nullable=False)
    cid: Mapped[str] = mapped_column(ForeignKey("customers.cid"), nullable=False)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)

    route: Mapped["Route"] = relationship(back_populates="route_customers")
    customer: Mapped["Customer"] = relationship(back_populates="route_customers")



