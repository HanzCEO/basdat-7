import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Star } from "lucide-react";
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

function AdminAnimatedMarkers({ locations }: { locations: DriverLocation[] }) {
  const map = useMap();
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const prevLocationsRef = useRef<Map<number, { lat: number; lng: number }>>(new Map());
  const animFramesRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    const markers = markersRef.current;
    const prevLocations = prevLocationsRef.current;
    const animFrames = animFramesRef.current;
    const currentIds = new Set(locations.map((l) => l.driver_id));

    for (const [id] of markers) {
      if (!currentIds.has(id)) {
        map.removeLayer(markers.get(id)!);
        markers.delete(id);
        prevLocations.delete(id);
        if (animFrames.has(id)) {
          cancelAnimationFrame(animFrames.get(id)!);
          animFrames.delete(id);
        }
      }
    }

    for (const loc of locations) {
      const id = loc.driver_id;
      const newPos: [number, number] = [loc.lat, loc.lng];
      const icon = getDriverIcon(loc.status, loc.status_pengiriman);
      const popupHtml = `<div style="font-family:Quicksand,sans-serif;padding:4px">
        <strong>${loc.nama}</strong><br />
        ${loc.jenis_kendaraan} &middot; ${loc.no_plat}<br />
        &#9733; ${loc.rating.toFixed(2)}<br />
        <span style="font-size:12px;color:#6b7280">
          ${loc.status_pengiriman === "menuju_restoran" ? "Heading to restaurant" : loc.status_pengiriman === "dalam_pengiriman" ? "Delivering order" : loc.status}
        </span>
      </div>`;

      if (markers.has(id)) {
        const marker = markers.get(id)!;
        marker.setIcon(icon);
        marker.setPopupContent(popupHtml);

        const prev = prevLocations.get(id);
        if (animFrames.has(id)) {
          cancelAnimationFrame(animFrames.get(id)!);
        }

        if (prev) {
          const from = { lat: prev.lat, lng: prev.lng };
          const to = { lat: loc.lat, lng: loc.lng };
          const duration = 2000;
          const start = performance.now();

          function animate(time: number) {
            const t = Math.min((time - start) / duration, 1);
            marker.setLatLng([
              from.lat + (to.lat - from.lat) * t,
              from.lng + (to.lng - from.lng) * t,
            ]);
            if (t < 1) {
              animFrames.set(id, requestAnimationFrame(animate));
            } else {
              animFrames.delete(id);
            }
          }

          animFrames.set(id, requestAnimationFrame(animate));
        } else {
          marker.setLatLng(newPos);
        }
      } else {
        const marker = L.marker(newPos, { icon });
        marker.bindPopup(popupHtml);
        marker.addTo(map);
        markers.set(id, marker);
      }

      prevLocations.set(id, { lat: loc.lat, lng: loc.lng });
    }
  }, [locations, map]);

  useEffect(() => {
    const markers = markersRef.current;
    const animFrames = animFramesRef.current;
    return () => {
      for (const [, frameId] of animFrames) {
        cancelAnimationFrame(frameId);
      }
      animFrames.clear();
      for (const [, marker] of markers) {
        map.removeLayer(marker);
      }
      markers.clear();
      prevLocationsRef.current.clear();
    };
  }, [map]);

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
                    <Star size={14} className="star-icon" /> {r.rating}
                    <br />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {r.menu.length} menu items
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
            <AdminAnimatedMarkers locations={locations} />
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
