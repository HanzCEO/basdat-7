import { useState, useMemo } from "react";
import { CartProvider } from "./context/CartContext";
import { Restaurant } from "./types";
import { restaurants } from "./data/mockData";
import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";
import RestaurantDetail from "./components/RestaurantDetail";
import CartBar from "./components/CartBar";
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

  if (selectedRestaurant) {
    return (
      <div className="app">
        <RestaurantDetail
          restaurant={selectedRestaurant}
          onBack={() => setSelectedRestaurant(null)}
        />
        <CartBar onDispatch={handleDispatch} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="search-container">
        <SearchBar onSearch={setSearchQuery} />
      </div>
      <MapView
        restaurants={filteredRestaurants}
        onSelectRestaurant={setSelectedRestaurant}
      />
      <CartBar onDispatch={handleDispatch} />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
