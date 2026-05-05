import { MenuItem as MenuItemType } from "../types";
import { useCart } from "../context/CartContext";

interface MenuItemProps {
  item: MenuItemType;
  restaurantId: string;
  restaurantName: string;
  isRecommended?: boolean;
}

export default function MenuItem({ item, restaurantId, restaurantName, isRecommended }: MenuItemProps) {
  const { addItem, removeItem, items, setPendingItem } = useCart();
  const cartItem = items.find((c) => c.item.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const existingRestaurantId = items[0]?.restaurantId;
  const isDifferentRestaurant = existingRestaurantId && existingRestaurantId !== restaurantId;

  const handleAdd = () => {
    if (isDifferentRestaurant) {
      setPendingItem(item, restaurantId, restaurantName);
    } else {
      addItem(item, restaurantId);
    }
  };

  return (
    <div className={`menu-item${isRecommended ? ' menu-item--recommended' : ''}`}>
      <div className="menu-item-info">
        <h4>{item.name}</h4>
        <p>{item.description}</p>
        <span className="price">Rp {item.price.toLocaleString()}</span>
      </div>
      <div className="menu-item-actions">
        <button
          className="btn-minus"
          onClick={() => removeItem(item.id)}
          disabled={quantity === 0}
        >
          -
        </button>
        <span className="quantity">{quantity}</span>
        <button className="btn-plus" onClick={handleAdd}>
          +
        </button>
      </div>
    </div>
  );
}