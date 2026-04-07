import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
}

export default function MapView({ restaurants, onSelectRestaurant }: MapViewProps) {
  return (
    <MapContainer
      center={[-6.2088, 106.8456]}
      zoom={14}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
        url="https://api.maptiler.com/tiles/light/{z}/{x}/{y}.png?key=VbirT4VB3VBpvWmGMZFI"
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
              <p>{restaurant.cuisine}</p>
              <p>Rating: {restaurant.rating}</p>
              <button onClick={() => onSelectRestaurant(restaurant)}>View Menu</button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
