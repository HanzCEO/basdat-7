import { Restaurant } from "../types";
import MenuItem from "./MenuItem";

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onBack: () => void;
}

export default function RestaurantDetail({ restaurant, onBack }: RestaurantDetailProps) {
  return (
    <div className="restaurant-detail">
      <header className="detail-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <div className="detail-info">
          <h2>{restaurant.name}</h2>
          <p>{restaurant.cuisine} • Rating: {restaurant.rating}</p>
        </div>
      </header>
      <div className="menu-list">
        <h3>Menu</h3>
        {restaurant.menu.map((item) => (
          <MenuItem key={item.id} item={item} restaurantId={restaurant.id} />
        ))}
      </div>
    </div>
  );
}
