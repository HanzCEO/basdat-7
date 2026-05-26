import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { getDriverLocations } from "../services/api";
import { DriverLocation } from "../types";
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

function getIcon(status: string, deliveryStatus: string) {
  if (deliveryStatus === "menuju_restoran" || deliveryStatus === "dalam_pengiriman") return blueIcon;
  if (status === "available") return greenIcon;
  return grayIcon;
}

function RecenterMap({ locations }: { locations: DriverLocation[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (locations.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.lat, loc.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
      fitted.current = true;
    }
  }, [locations, map]);

  return null;
}

export default function AdminLiveMap() {
  const [locations, setLocations] = useState<DriverLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = () => {
      getDriverLocations()
        .then(setLocations)
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {loading ? (
        <div className="admin-loading">Loading map...</div>
      ) : (
        <MapContainer
          center={[-6.2088, 106.8456]}
          zoom={13}
          className="admin-map"
          style={{ flex: 1, borderRadius: 12 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
            url="https://api.maptiler.com/maps/base-v4-light/{z}/{x}/{y}@2x.png?key=7YGFx6IJMbItHm2OZuIY"
          />
          <RecenterMap locations={locations} />
          {locations.map((loc) => (
            <Marker
              key={loc.driver_id}
              position={[loc.lat, loc.lng]}
              icon={getIcon(loc.status, loc.status_pengiriman)}
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
      {locations.length > 0 && (
        <div
          style={{
            padding: "8px 16px",
            background: "var(--color-white)",
            borderTop: "1px solid var(--color-gray-light)",
            fontSize: 13,
            color: "var(--color-gray)",
          }}
        >
          Showing {locations.length} active driver{locations.length !== 1 ? "s" : ""} &middot; Auto-refreshes every 10s
        </div>
      )}
    </div>
  );
}
