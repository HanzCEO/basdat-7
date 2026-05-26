import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { getDriverLocations, getRestaurants } from "../services/api";
import { DriverLocation, Restaurant } from "../types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const greenIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;background:#22c55e;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const blueIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const grayIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;background:#9ca3af;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const restaurantIcon = L.divIcon({
  className: "",
  html: `<div style="width:32px;height:32px;background:#ef4444;border:3px solid #fff;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:16px;box-shadow:0 2px 6px rgba(0,0,0,0.3);line-height:1;">R</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function getDriverIcon(status: string, deliveryStatus: string) {
  if (deliveryStatus === "menuju_restoran" || deliveryStatus === "dalam_pengiriman") return blueIcon;
  if (status === "available") return greenIcon;
  return grayIcon;
}

type Point = { lat: number; lng: number };

function RecenterMap({ points }: { points: Point[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (points.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      fitted.current = true;
    }
  }, [points, map]);

  return null;
}

export default function AdminLiveMap() {
  const [locations, setLocations] = useState<DriverLocation[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = () => {
      getDriverLocations()
        .then(setLocations)
        .catch(console.error);
    };

    getRestaurants()
      .then(setRestaurants)
      .catch(console.error);

    fetchLocations();
    const interval = setInterval(fetchLocations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (restaurants.length > 0) {
      setLoading(false);
    }
  }, [restaurants]);

  const allPoints = [
    ...locations.map((l) => ({ lat: l.lat, lng: l.lng })),
    ...restaurants.map((r) => ({ lat: r.lat, lng: r.lng })),
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, position: "relative", minHeight: 500 }}>
        {loading ? (
          <div className="admin-loading" style={{ height: "100%" }}>Loading map...</div>
        ) : (
          <MapContainer
            center={[-6.2088, 106.8456]}
            zoom={13}
            className="admin-map"
            style={{ height: "100%", borderRadius: 12 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
              url="https://api.maptiler.com/maps/base-v4-light/{z}/{x}/{y}@2x.png?key=7YGFx6IJMbItHm2OZuIY"
            />
            <RecenterMap points={allPoints} />
            {restaurants.map((r) => (
              <Marker
                key={`rest-${r.id}`}
                position={[r.lat, r.lng]}
                icon={restaurantIcon}
              >
                <Popup>
                  <div style={{ fontFamily: "Quicksand, sans-serif", padding: 4 }}>
                    <strong style={{ fontSize: 14 }}>{r.name}</strong>
                    <br />
                    &#9733; {r.rating}
                    <br />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {r.menu.length} menu items
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
            {locations.map((loc) => (
              <Marker
                key={loc.driver_id}
                position={[loc.lat, loc.lng]}
                icon={getDriverIcon(loc.status, loc.status_pengiriman)}
              >
                <Popup>
                  <div style={{ fontFamily: "Quicksand, sans-serif", padding: 4 }}>
                    <strong>{loc.nama}</strong>
                    <br />
                    {loc.jenis_kendaraan} &middot; {loc.no_plat}
                    <br />
                    &#9733; {loc.rating.toFixed(2)}
                    <br />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {loc.status_pengiriman === "menuju_restoran"
                        ? "Heading to restaurant"
                        : loc.status_pengiriman === "dalam_pengiriman"
                        ? "Delivering order"
                        : loc.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        <div className="admin-map-legend">
          <span><span className="legend-dot blue" /> Active driver</span>
          <span><span className="legend-dot green" /> Available driver</span>
          <span><span className="legend-dot gray" /> Offline driver</span>
          <span><span className="legend-dot red" /> Restaurant</span>
        </div>
      </div>
      <div
        style={{
          padding: "8px 16px",
          background: "var(--color-white)",
          borderTop: "1px solid var(--color-gray-light)",
          fontSize: 13,
          color: "var(--color-gray)",
        }}
      >
        {restaurants.length} restaurants &middot; {locations.length} active driver{locations.length !== 1 ? "s" : ""} &middot; Auto-refreshes every 10s
      </div>
    </div>
  );
}
