import { useState, useRef, useEffect } from "react";
import { Restaurant } from "../types";
import MenuItem from "./MenuItem";
import { useCart } from "../context/CartContext";

interface PullUpMenuProps {
  restaurant: Restaurant;
  onClose: () => void;
  onDispatch: () => void;
}

const COLLAPSED_HEIGHT = 120;
const EXPANDED_HEIGHT = window.innerHeight * 0.8;

export default function PullUpMenu({ restaurant, onClose, onDispatch }: PullUpMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const { totalItems, totalPrice } = useCart();
  const dragStartY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    setDragOffset(0);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    const delta = clientY - dragStartY.current;
    setDragOffset(delta);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const finalOffset = dragOffset;
    setDragOffset(0);

    if (finalOffset < -50) {
      setIsExpanded(true);
    } else if (finalOffset > 50) {
      setIsExpanded(false);
      if (finalOffset > 150) {
        onClose();
      }
    }
  };

  useEffect(() => {
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  const menuHeight = isExpanded
    ? EXPANDED_HEIGHT
    : isDragging
    ? COLLAPSED_HEIGHT - dragOffset
    : COLLAPSED_HEIGHT;

  const bottomOffset = isExpanded
    ? 0
    : isDragging
    ? dragOffset
    : 0;

  return (
    <div
      ref={menuRef}
      className="pullup-menu"
      style={{
        height: `${menuHeight}px`,
        transform: `translateY(${bottomOffset}px)`,
        transition: isDragging ? "none" : "all 0.3s ease",
      }}
      onMouseDown={(e) => handleDragStart(e.clientY)}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
      onMouseMove={(e) => handleDragMove(e.clientY)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
    >
      <div className="pullup-handle" />

      <div className="pullup-content">
        <header className="pullup-header">
          <div className="pullup-info">
            <h2>{restaurant.name}</h2>
            <p>{restaurant.cuisine} • Rating: {restaurant.rating}</p>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </header>

        <div className="pullup-menu-list">
          {restaurant.menu.map((item) => (
            <MenuItem key={item.id} item={item} restaurantId={restaurant.id} />
          ))}
        </div>
      </div>

      {totalItems > 0 && (
        <div className="pullup-cart-bar">
          <div className="cart-info">
            <span className="cart-count">{totalItems} items</span>
            <span className="cart-total">Rp {totalPrice.toLocaleString()}</span>
          </div>
          <button className="btn-dispatch" onClick={onDispatch}>
            Dispatch Driver
          </button>
        </div>
      )}
    </div>
  );
}
