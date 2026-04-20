import React, { useEffect, useState } from "react";
import Header from "./Header";
import './RoutesPlanning.css';

const mockDays = [
  "2025-06-10",
  "2025-06-09",
  "2025-06-08",
  "2025-06-07",
];

const RoutesPlanning = ({ setIsLoggedIn }) => {
  const [warehouse, setWarehouse] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [selectedDay, setSelectedDay] = useState("2024-06-10"); // default to latest

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/routePlan?day=${selectedDay}`)
      .then((response) => response.json())
      .then((data) => {
        setWarehouse(data.message);
        setRoutes(data.routes);
        setSelectedTruck(null); 
      })
      .catch((error) => {
        console.error("Error fetching from FastAPI:", error);
      });
  }, [selectedDay]);

  const handleViewMap = (routeObj) => {
    console.log("Viewing on map:", routeObj);
  };

  return (
    <div>
      <Header setIsLoggedIn={setIsLoggedIn} />
      <div className="routes-layout">
        <div className="sidebar-days">
          <h4 className="sidebar-days-title">Previous Days</h4>
          <ul className="sidebar-days-list">
            {mockDays.map((day) => (
              <li key={day}>
                <button
                  className={`sidebar-day-btn${day === selectedDay ? ' selected' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="routes-main-content">
          <div className="routes-info">
            {routes?.length > 0 ? (
              <div className="routes-container">
                {selectedTruck ? (
                  <div className="route-card route-card-single">
                    <h3 className="route-title">🚚 Truck {selectedTruck.truck_id}</h3>
                    <p><strong>Route:</strong> {selectedTruck.route.join(" → ")}</p>
                    <p><strong>Total Distance:</strong> {(selectedTruck.total_distance / 1000).toFixed(2)} Kms</p>
                    <p><strong>Total Customers:</strong> {selectedTruck.route.length - 2}</p>
                    <p><strong>Estimated Time:</strong> {selectedTruck.estimated_time ? selectedTruck.estimated_time : 'N/A'}</p>
                    <p><strong>Capacity Used:</strong> {selectedTruck.capacity_used ? selectedTruck.capacity_used : 'N/A'}</p>
                    <button className="view-map-btn" onClick={() => handleViewMap(selectedTruck)}>
                      View on Map
                    </button>
                    <button
                      className="view-map-btn"
                      onClick={() => setSelectedTruck(null)}
                    >
                      Back to Overview
                    </button>
                  </div>
                ) : (
                  <div className="route-cards-overview">
                    {routes.map((routeObj, idx) => (
                      <div
                        key={idx}
                        className="route-card route-card-overview"
                        onClick={() => setSelectedTruck(routeObj)}
                      >
                        <h3 className="route-title">🚚 Truck {routeObj.truck_id}</h3>
                        <p><strong>Stops:</strong> {routeObj.route.length - 2}</p>
                        <p><strong>Distance:</strong> {(routeObj.total_distance / 1000)} Kms</p>
                        <p> <strong>Cost: </strong>Rs. {((routeObj.total_distance / 1000)*20).toFixed(2)}</p>
                        <p><em>Click for details</em></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2>No routes planned yet</h2>
                <p>Please wait while the system calculates the optimal routes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default RoutesPlanning;
