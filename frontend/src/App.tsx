import { useState, useMemo, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { Restaurant } from "./types";
import { restaurants } from "./data/mockData";
import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";
import PullUpMenu from "./components/PullUpMenu";
import Onboarding, { checkOnboardingCompleted } from "./components/Onboarding";
import "./App.scss";

function AppContent() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRestaurants = useMemo(() => {
    if (!searchQuery) return restaurants;
    return restaurants.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleDispatch = () => {
    alert("Driver dispatched! (Mock)");
  };

  return (
    <div className="app">
      <div className="search-container">
        <SearchBar onSearch={setSearchQuery} />
      </div>
      <MapView
        restaurants={filteredRestaurants}
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
