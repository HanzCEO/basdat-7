import { useCart } from "../context/CartContext";

interface CartBarProps {
  onDispatch: () => void;
}

export default function CartBar({ onDispatch }: CartBarProps) {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="cart-bar">
      <div className="cart-info">
        <span className="cart-count">{totalItems} items</span>
        <span className="cart-total">Rp {totalPrice.toLocaleString()}</span>
      </div>
      <button className="btn-dispatch" onClick={onDispatch}>
        Dispatch Driver
      </button>
    </div>
  );
}
