import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Map({ routePoints }) {
  const defaultRoute = [
    [23.0749060226892, 72.5257609969722],
    [23.128935708010783, 72.54538875093972], 
    [23.098119673243165, 72.54943212210249], 
  ];
  const points = routePoints && routePoints.length > 0 ? routePoints : defaultRoute;
  return (
    <div>
      <MapContainer center={[23.0225, 72.5714]} zoom={11.25} style={{ height: "70vh", width: "70vw" }} >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((pos, idx) => (
          <Marker key={idx} position={pos}>
            <Popup>Point {idx + 1}</Popup>
          </Marker>
        ))}

        <Polyline positions={points} color="blue" />
      </MapContainer>
    </div>
  );
};

export default Map;
