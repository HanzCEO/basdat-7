import { useState, useRef, useCallback, useEffect } from "react";
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

    setCurrentHeight((prev) => {
      if (prev < SNAP_THRESHOLD) {
        setIsExpanded(false);
        if (prev < COLLAPSED_HEIGHT / 2) {
          onClose();
        }
        return COLLAPSED_HEIGHT;
      } else {
        setIsExpanded(true);
        return EXPANDED_HEIGHT;
      }
    });
  }, [onClose]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientY);
        if (isDragging.current) {
          e.preventDefault();
        }
      }
    };
    const onMouseUp = () => handleDragEnd();
    const onTouchEnd = () => handleDragEnd();

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  const handleDragStart = useCallback((clientY: number) => {
    isDragging.current = true;
    dragStartY.current = clientY;
    heightStart.current = currentHeight;
  }, [currentHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  return (
    <div
      className="pullup-menu"
      style={{
        height: `${currentHeight}px`,
        transition: isDragging.current ? "none" : "all 0.3s ease",
      }}
    >
      <div className="pullup-handle" />

      <div
        className="pullup-content"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
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
            Pesan
          </button>
        </div>
      )}
    </div>
  );
}
