import React from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = ({ setIsLoggedIn }) => {
  const stats = {
    totalCustomers: 50,
    activeTrucks: 2,
    completedRoutes: "200km",
    pendingDeliveries: 20,
    totalDistance: "500km",
    averageDeliveryTime: "100hrs",
  };
  return (
    <div>
      <Header setIsLoggedIn={setIsLoggedIn} />
      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <img
                  src="/customers-icon.png"
                  alt="Customers"
                  className="stat-icon"
                />
                <h3>Total Customers</h3>
                <p className="stat-number">{stats.totalCustomers}</p>
              </div>
              <div
                className="stat-footer1"
                style={{ backgroundColor: "rgb(104, 170, 211)" }}
              ></div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <img src="/truck-icon.png" alt="Trucks" className="stat-icon" />

                <h3>Active Trucks</h3>
                <p className="stat-number">{stats.activeTrucks}</p>
              </div>
              <div
                className="stat-footer1"
                style={{ backgroundColor: "rgb(40, 107, 150)" }}
              ></div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <img src="/route-icon.png" alt="Routes" className="stat-icon" />

                <h3>Completed Routes</h3>
                <p className="stat-number">{stats.completedRoutes}</p>
              </div>
              <div
                className="stat-footer1"
                style={{ backgroundColor: "rgb(104, 170, 211)" }}
              ></div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <img
                  src="/delivery-icon.png"
                  alt="Deliveries"
                  className="stat-icon"
                />
                <h3>Pending Deliveries</h3>
                <p className="stat-number">{stats.pendingDeliveries}</p>
              </div>
              <div
                className="stat-footer1"
                style={{ backgroundColor: "rgb(104, 170, 211)" }}
              ></div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <img
                  src="/distance-icon.png"
                  alt="Distance"
                  className="stat-icon"
                />
                <h3>Total Distance</h3>
                <p className="stat-number">{stats.totalDistance}</p>
              </div>
              <div
                className="stat-footer1"
                style={{ backgroundColor: "rgb(40, 107, 150)" }}
              ></div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <img src="/time-icon.png" alt="Time" className="stat-icon" />

                <h3>Avg. Delivery Time</h3>
                <p className="stat-number">{stats.averageDeliveryTime}</p>
              </div>
              <div
                className="stat-footer1"
                style={{ backgroundColor: "rgb(104, 170, 211)" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
