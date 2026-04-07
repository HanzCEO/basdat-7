import { MenuItem as MenuItemType } from "../types";
import { useCart } from "../context/CartContext";

interface MenuItemProps {
  item: MenuItemType;
  restaurantId: string;
}

export default function MenuItem({ item, restaurantId }: MenuItemProps) {
  const { addItem, removeItem, items } = useCart();
  const cartItem = items.find((c) => c.item.id === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="menu-item">
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
        <button
          className="btn-plus"
          onClick={() => addItem(item, restaurantId)}
        >
          +
        </button>
      </div>
    </div>
  );
}
