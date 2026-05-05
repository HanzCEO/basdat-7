import { useState, useEffect, memo } from "react";
import { MenuItem as MenuItemType } from "../types";
import { useCart } from "../context/CartContext";

const imageCache = new Map<string, string>();
const pendingFetches = new Set<string>();

interface MenuItemProps {
  item: MenuItemType;
  restaurantId: string;
  restaurantName: string;
  isRecommended?: boolean;
}

const MenuItem = memo(function MenuItem({ item, restaurantId, restaurantName, isRecommended }: MenuItemProps) {
  const { addItem, removeItem, items, setPendingItem } = useCart();
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const id = item.id;

    if (imageCache.has(id)) {
      setImageUrl(imageCache.get(id)!);
      return;
    }

    if (pendingFetches.has(id)) return;

    pendingFetches.add(id);
    fetch("https://foodish-api.com/api/")
      .then((res) => res.json())
      .then((data) => {
        imageCache.set(id, data.image);
        pendingFetches.delete(id);
        setImageUrl(data.image);
      })
      .catch(() => {
        pendingFetches.delete(id);
      });
  }, []);
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

  const classes = [
    'menu-item',
    isRecommended && !item.isOutOfStock ? 'menu-item--recommended' : '',
    item.isOutOfStock ? 'menu-item--out-of-stock' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="menu-item-info">
        <h4>
          {item.name}
          {isRecommended && !item.isOutOfStock && (
            <svg className="fire-icon" width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="menu-item-info-footer">
          <div className="menu-item-price-row">
            <span className="price">Rp {item.price.toLocaleString()}</span>
            {isRecommended && !item.isOutOfStock && <span className="best-selling-badge">TOP PICKS</span>}
            {item.isOutOfStock && <span className="out-of-stock-badge">OUT OF STOCK</span>}
          </div>
          <div className="menu-item-actions">
            <button
              className="btn-minus"
              onClick={() => removeItem(item.id)}
              disabled={quantity === 0 || item.isOutOfStock}
            >
              -
            </button>
            <span className="quantity">{item.isOutOfStock ? 0 : quantity}</span>
            <button
              className="btn-plus"
              onClick={handleAdd}
              disabled={item.isOutOfStock}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="menu-item-image">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={item.name}
          />
        )}
      </div>
    </div>
  );
});

export default MenuItem;