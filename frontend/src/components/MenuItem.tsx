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
        <h4>
          {item.name}
          {isRecommended && (
            <svg className="fire-icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <defs>
                <linearGradient id={`flameGrad-${item.id}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#e74c3c" />
                  <stop offset="100%" stopColor="#ff7979" />
                </linearGradient>
              </defs>
              <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" fill={`url(#flameGrad-${item.id})`} stroke="#c0392b" />
            </svg>
          )}
        </h4>
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