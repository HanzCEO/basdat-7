import { useState, useMemo, useEffect, useCallback } from "react";
import { CartProvider, useCart } from "./context/CartContext";
import { Restaurant, Driver } from "./types";
import { generateNearbyRestaurants, mockDrivers } from "./data/mockData";
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
  const [phase, setPhase] = useState<'order' | 'delivery'>('order');
  const [driver, setDriver] = useState<Driver | null>(null);
  const { clearCart } = useCart();

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

  const handleDispatch = useCallback(() => {
    const randomDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
    setDriver(randomDriver);
    setPhase('delivery');
    clearCart();
  }, [clearCart]);

  const handleClose = useCallback(() => {
    setSelectedRestaurant(null);
    setPhase('order');
    setDriver(null);
  }, []);

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
          onClose={handleClose}
          onDispatch={handleDispatch}
          phase={phase}
          driver={driver}
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
