import { useState, useMemo, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { Restaurant } from "./types";
import { generateNearbyRestaurants } from "./data/mockData";
import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";
import PullUpMenu from "./components/PullUpMenu";
import Onboarding, { checkOnboardingCompleted } from "./components/Onboarding";
import "./App.scss";

const DEFAULT_LOCATION = { lat: -6.2088, lng: 106.8456 };

function AppContent() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setUserLocation(DEFAULT_LOCATION);
      }
    );
  }, []);

  const location = userLocation ?? DEFAULT_LOCATION;

  const restaurants = useMemo(
    () => generateNearbyRestaurants(location.lat, location.lng),
    [location]
  );

  const filteredRestaurants = useMemo(() => {
    if (!searchQuery) return restaurants;
    return restaurants.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, restaurants]);

  const handleDispatch = () => {
    alert("Driver dispatched! (Mock)");
  };

  return (
    <div className="app">
      <div className="search-container">
        <SearchBar onSearch={setSearchQuery} />
      </div>
      <MapView
        userLocation={location}
        restaurants={filteredRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={setSelectedRestaurant}
      />
      {selectedRestaurant && (
        <PullUpMenu
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          onDispatch={handleDispatch}
        />
      )}
    </div>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setShowOnboarding(!checkOnboardingCompleted());
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <CartProvider>
      {showOnboarding ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <AppContent />
      )}
    </CartProvider>
  );
}

export default App;
