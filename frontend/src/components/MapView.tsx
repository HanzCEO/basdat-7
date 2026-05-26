import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import { Restaurant } from "../types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#4285F4;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">D</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface MapViewProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  userLocation: { lat: number; lng: number };
  selectedRestaurant: Restaurant | null;
  phase: 'order' | 'delivery';
  driverProgress?: number | null;
}

function getPositionAlongRoute(coords: [number, number][], progress: number): [number, number] {
  if (coords.length === 0) return coords[0];
  if (progress <= 0) return coords[0];
  if (progress >= 1) return coords[coords.length - 1];

  let totalDist = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    totalDist += Math.hypot(coords[i + 1][0] - coords[i][0], coords[i + 1][1] - coords[i][1]);
  }

  let cumDist = 0;
  const targetDist = progress * totalDist;
  for (let i = 0; i < coords.length - 1; i++) {
    const segDist = Math.hypot(coords[i + 1][0] - coords[i][0], coords[i + 1][1] - coords[i][1]);
    if (cumDist + segDist >= targetDist) {
      const t = segDist > 0 ? (targetDist - cumDist) / segDist : 0;
      return [
        coords[i][0] + (coords[i + 1][0] - coords[i][0]) * t,
        coords[i][1] + (coords[i + 1][1] - coords[i][1]) * t,
      ];
    }
    cumDist += segDist;
  }

  return coords[coords.length - 1];
}

function MapController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
  }, [map, lat, lng]);
  return null;
}

function RouteBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const raw = L.latLngBounds(coords);
    const padLat = (raw.getNorth() - raw.getSouth()) * 0.2 || 0.002;
    const padLng = (raw.getEast() - raw.getWest()) * 0.2 || 0.002;
    const bounds = L.latLngBounds(
      [raw.getSouth() - padLat, raw.getWest() - padLng],
      [raw.getNorth() + padLat, raw.getEast() + padLng]
    );
    map.flyToBounds(bounds, { animate: true, maxZoom: 16, duration: 0.6 });
  }, [map, coords]);
  return null;
}

function AnimatedDriverMarker({
  routeCoords,
  driverProgress,
}: {
  routeCoords: [number, number][] | null;
  driverProgress: number | null;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const animFrameRef = useRef<number>(0);
  const prevProgressRef = useRef<number | null>(null);

  useEffect(() => {
    const marker = L.marker([0, 0], { icon: driverIcon });
    marker.bindPopup('<div class="driver-popup"><strong>Driver</strong></div>');
    marker.addTo(map);
    markerRef.current = marker;
    prevProgressRef.current = null;
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      map.removeLayer(marker);
    };
  }, [map]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || driverProgress == null || !routeCoords || routeCoords.length === 0) return;

    const reversed = [...routeCoords].reverse();
    const prevProgress = prevProgressRef.current;
    prevProgressRef.current = driverProgress;

    cancelAnimationFrame(animFrameRef.current);

    if (prevProgress == null) {
      marker.setLatLng(getPositionAlongRoute(reversed, driverProgress));
      return;
    }

    const duration = 900;
    const start = performance.now();

    function animate(time: number) {
      const t = Math.min((time - start) / duration, 1);
      const interpProgress = prevProgress + (driverProgress - prevProgress) * t;
      marker.setLatLng(getPositionAlongRoute(reversed, interpProgress));
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [driverProgress, routeCoords]);

  return null;
}

export default function MapView({
  restaurants,
  onSelectRestaurant,
  userLocation,
  selectedRestaurant,
  phase,
  driverProgress,
}: MapViewProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);

  useEffect(() => {
    if (!selectedRestaurant) {
      setRouteCoords(null);
      return;
    }

    setRouteCoords(null);
    const abort = new AbortController();
    const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${selectedRestaurant.lng},${selectedRestaurant.lat}?geometries=geojson`;

    fetch(url, { signal: abort.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "Ok" && data.routes?.length) {
          const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: number[]) => [lat, lng] as [number, number]
          );
          setRouteCoords(coords);
        }
      })
      .catch(() => {});

    return () => abort.abort();
  }, [selectedRestaurant, userLocation]);

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={14}
      zoomSnap={0.1}
      className="map-container"
    >
      <MapController lat={userLocation.lat} lng={userLocation.lng} />
      <TileLayer
        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
        url="https://api.maptiler.com/maps/base-v4-light/{z}/{x}/{y}@2x.png?key=7YGFx6IJMbItHm2OZuIY"
      />
      <Circle
        center={[userLocation.lat, userLocation.lng]}
        radius={30}
        pathOptions={{ color: "#4285F4", fillColor: "#4285F4", fillOpacity: 0.3 }}
      />
      {(phase === 'delivery' && selectedRestaurant
        ? restaurants.filter((r) => r.id === selectedRestaurant.id)
        : restaurants
      ).map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.lat, restaurant.lng]}
          icon={customIcon}
          eventHandlers={{
            click: () => onSelectRestaurant(restaurant),
          }}
        >
          <Popup>
            <div className="restaurant-popup">
              <h3>{restaurant.name}</h3>
              <p>{restaurant.cuisine} • {restaurant.rating} ★</p>
            </div>
          </Popup>
        </Marker>
      ))}
      {routeCoords && (
        <>
          <RouteBounds coords={routeCoords} />
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: "#4285F4", weight: 4, opacity: 0.8 }}
          />
        </>
      )}
      {phase === 'delivery' && driverProgress != null && routeCoords && (
        <AnimatedDriverMarker routeCoords={routeCoords} driverProgress={driverProgress} />
      )}
    </MapContainer>
  );
}
