import { useState, useRef, useCallback } from "react";
import { Restaurant } from "../types";
import MenuItem from "./MenuItem";
import { useCart } from "../context/CartContext";

interface PullUpMenuProps {
  restaurant: Restaurant;
  onClose: () => void;
  onDispatch: () => void;
}

const COLLAPSED_HEIGHT = 120;
const EXPANDED_HEIGHT = typeof window !== "undefined" ? window.innerHeight * 0.8 : 500;
const SNAP_THRESHOLD = (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2;

export default function PullUpMenu({ restaurant, onClose, onDispatch }: PullUpMenuProps) {
  const [_isExpanded, setIsExpanded] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(COLLAPSED_HEIGHT);
  const { totalItems, totalPrice } = useCart();
  
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const heightStart = useRef(COLLAPSED_HEIGHT);

  const handleDragStart = useCallback((clientY: number) => {
    isDragging.current = true;
    dragStartY.current = clientY;
    heightStart.current = currentHeight;
  }, [currentHeight]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging.current) return;
    const delta = clientY - dragStartY.current;
    const newHeight = heightStart.current - delta;
    const clampedHeight = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
    setCurrentHeight(clampedHeight);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (currentHeight < SNAP_THRESHOLD) {
      setIsExpanded(false);
      setCurrentHeight(COLLAPSED_HEIGHT);
      if (currentHeight < COLLAPSED_HEIGHT / 2) {
        onClose();
      }
    } else {
      setIsExpanded(true);
      setCurrentHeight(EXPANDED_HEIGHT);
    }
  }, [currentHeight, onClose]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  return (
    <div
      className="pullup-menu"
      style={{
        height: `${currentHeight}px`,
        transition: isDragging.current ? "none" : "all 0.3s ease",
      }}
    >
      <div
        className="pullup-handle"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
      />

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
