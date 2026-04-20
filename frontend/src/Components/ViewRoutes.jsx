import React, { useState } from "react";
import Header from "./Header";
import Map from "./Map";
import "./ViewRoutes.css";

const mockDays = [
  "2025-06-10",
  "2025-06-09",
  "2025-06-08",
];

const mockRoutes = {
  "2025-06-10": [
    { truck_id: 1, route: [[23.0749, 72.5257], [23.1289, 72.5453], [23.0981, 72.5494]], total_distance: 60.75, stops: 24 },
    { truck_id: 2, route: [[23.0225, 72.5714], [23.0300, 72.5800], [23.0400, 72.5900]], total_distance: 71.89, stops: 26 },
  ],
  "2025-06-09": [
    { truck_id: 1, route: [[23.0749, 72.5257], [23.0800, 72.5300], [23.0900, 72.5400]], total_distance: 7.2, stops: 10 },
  ],
  "2025-06-08": [
    { truck_id: 2, route: [[23.0225, 72.5714], [23.0250, 72.5750], [23.0300, 72.5800]], total_distance: 5.6, stops: 8 },
  ],
};

function ViewRoutes({ setIsLoggedIn }) {

    const [selectedDay, setSelectedDay] = useState(mockDays[0]);
  const [selectedTruck, setSelectedTruck] = useState("");

  const trucksForDay = selectedDay ? mockRoutes[selectedDay] || [] : [];
  const selectedTruckObj = trucksForDay.find(t => String(t.truck_id) === selectedTruck);
  const allRoutesPoints = trucksForDay.flatMap(t => t.route);

  const totalDistance = trucksForDay.reduce((sum, t) => sum + t.total_distance, 0);
  const totalStops = trucksForDay.reduce((sum, t) => sum + (t.stops || t.route.length), 0);
  const routeDiff = trucksForDay.length > 1 ? Math.abs(trucksForDay[0].total_distance - trucksForDay[1].total_distance) : 0;

  const maxDistance = Math.max(...trucksForDay.map(t => t.total_distance), 1);

  return (
    <div>
      <Header setIsLoggedIn={setIsLoggedIn} />
      <div className="stats-bar">
        <div className="stat-card-map">
          <div className="stat-icon">🚗</div>
          <div className="stat-label">Total Distance</div>
          <div className="stat-value">{totalDistance.toFixed(2)} km</div>
        </div>
        <div className="stat-card-map">
          <div className="stat-icon">📍</div>
          <div className="stat-label">Total Stops</div>
          <div className="stat-value">{totalStops}</div>
        </div>
        <div className="stat-card-map">
          <div className="stat-icon">↔️</div>
          <div className="stat-label">Route Difference</div>
          <div className="stat-value">{routeDiff.toFixed(2)} km</div>
        </div>
      </div>
      <div className="route-distribution">
        {trucksForDay.map((truck, idx) => (
          <div className="route-bar" key={truck.truck_id}>
            <div className="route-bar-label" style={{ color: idx === 0 ? '#1a4fa0' : '#1ca04f' }}>
              Route Truck {truck.truck_id}
            </div>
            <div className="route-bar-progress">
              <div
                className="route-bar-progress-inner"
                style={{
                  width: `${(truck.total_distance / maxDistance) * 100}%`,
                  background: idx === 0 ? '#1a4fa0' : '#1ca04f',
                }}
              />
            </div>
            <div className="route-bar-value">
              {truck.stops} stops • {truck.total_distance.toFixed(2)} km
            </div>
          </div>
        ))}
      </div>

      <div className="route-filters">
        <button
          className={`route-filter-btn${!selectedTruck ? ' selected' : ''}`}
          onClick={() => setSelectedTruck("")}
        >
          <span role="img" aria-label="all">🗂️</span> All Routes
        </button>
        {trucksForDay.map((truck, idx) => (
          <button
            key={truck.truck_id}
            className={`route-filter-btn${String(truck.truck_id) === selectedTruck ? ' selected' : ''}`}
            style={{ color: idx === 0 ? '#1a4fa0' : '#1ca04f' }}
            onClick={() => setSelectedTruck(String(truck.truck_id))}
          >
            <span role="img" aria-label={`truck${truck.truck_id}`}>🚚</span> Route Truck {truck.truck_id}
          </button>
        ))}
      </div>

      <div className="truck-cards-row">
        {trucksForDay.length === 0 ? (
          <div className="info-message">No trucks for this day.</div>
        ) : (
          trucksForDay.map(truck => (
            <div
              key={truck.truck_id}
              className={`truck-card${String(truck.truck_id) === selectedTruck ? " selected" : ""}`}
              onClick={() => setSelectedTruck(String(truck.truck_id))}
              style={{ transition: 'all 0.2s' }}
            >
              <div className="truck-icon">🚚</div>
              <div className="truck-title">Truck {truck.truck_id}</div>
              <div className="truck-info">Distance: {truck.total_distance} km</div>
            </div>
          ))
        )}
      </div>
      <div className="map-wrapper">
        <div className="map-container">
          {trucksForDay.length === 0 ? (
            <div className="info-message">No routes available for this day.</div>
          ) : selectedTruck && selectedTruckObj ? (
            <Map routePoints={selectedTruckObj.route} />
          ) : (
            <Map routePoints={allRoutesPoints} />
          )}
        </div>
      </div>
    </div>
  );
}
export default ViewRoutes;
