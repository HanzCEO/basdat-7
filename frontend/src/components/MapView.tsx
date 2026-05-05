import { useEffect, useState } from "react";
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

interface MapViewProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  userLocation: { lat: number; lng: number };
  selectedRestaurant: Restaurant | null;
}

function MapController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.5 });
  }, [map, lat, lng]);
  return null;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function RouteBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(coords);
    const targetZoom = (map as any).getBoundsZoom(bounds, { padding: [50, 50] });
    const targetCenter = bounds.getCenter();
    const startCenter = map.getCenter();
    const startZoom = map.getZoom();
    const startTime = performance.now();

    const raf = requestAnimationFrame(function animate(time) {
      const t = Math.min((time - startTime) / 600, 1);
      const e = easeInOut(t);
      map.setView(
        [
          startCenter.lat + (targetCenter.lat - startCenter.lat) * e,
          startCenter.lng + (targetCenter.lng - startCenter.lng) * e,
        ],
        startZoom + (targetZoom - startZoom) * e,
        { animate: false }
      );
      if (t < 1) requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(raf);
  }, [map, coords]);
  return null;
}

export default function MapView({
  restaurants,
  onSelectRestaurant,
  userLocation,
  selectedRestaurant,
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
      {restaurants.map((restaurant) => (
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
    </MapContainer>
  );
}
