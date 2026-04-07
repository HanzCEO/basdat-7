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

export default function PullUpMenu({ restaurant, onClose, onDispatch }: PullUpMenuProps) {
  const [menuHeight, setMenuHeight] = useState(COLLAPSED_HEIGHT);
  const [menuDragging, setMenuDragging] = useState(false);
  const [pesanOffset, setPesanOffset] = useState(0);
  const [pesanExpanded, setPesanExpanded] = useState(false);
  const { totalItems, totalPrice } = useCart();
  
  const dragRef = useRef({
    startY: 0,
    startX: 0,
    heightStart: COLLAPSED_HEIGHT,
    pesanStartOffset: 0,
  });

  const handlePointerMove = useCallback((clientY: number, clientX: number) => {
    if (!menuDragging && pesanOffset === 0) return;

    if (menuDragging) {
      const delta = dragRef.current.startY - clientY;
      const newHeight = dragRef.current.heightStart + delta;
      const clamped = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
      setMenuHeight(clamped);
    }

    if (pesanOffset > 0 || pesanExpanded) {
      const delta = dragRef.current.startX - clientX;
      const newOffset = Math.max(0, dragRef.current.pesanStartOffset + delta);
      setPesanOffset(newOffset);
      if (newOffset > 150) {
        setPesanExpanded(true);
      } else {
        setPesanExpanded(false);
      }
    }
  }, [menuDragging, pesanOffset, pesanExpanded]);

  const handlePointerUp = useCallback(() => {
    if (menuDragging) {
      setMenuHeight((current) => {
        if (current < COLLAPSED_HEIGHT + 50) {
          if (current < COLLAPSED_HEIGHT / 2) {
            onClose();
          }
          return COLLAPSED_HEIGHT;
        }
        return EXPANDED_HEIGHT;
      });
      setMenuDragging(false);
    }

    if (pesanOffset > 0 || pesanExpanded) {
      if (pesanExpanded) {
        onDispatch();
      }
      setPesanOffset(0);
      setPesanExpanded(false);
    }

    dragRef.current = { startY: 0, startX: 0, heightStart: COLLAPSED_HEIGHT, pesanStartOffset: 0 };
  }, [menuDragging, pesanOffset, pesanExpanded, onClose, onDispatch]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientY, e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      handlePointerMove(e.touches[0].clientY, e.touches[0].clientX);
      if (menuDragging) {
        e.preventDefault();
      }
    };
    const onMouseUp = () => handlePointerUp();
    const onTouchEnd = () => handlePointerUp();

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
  }, [handlePointerMove, handlePointerUp, menuDragging]);

  const handleMenuPointerDown = (clientY: number) => {
    dragRef.current = {
      startY: clientY,
      startX: 0,
      heightStart: menuHeight,
      pesanStartOffset: 0,
    };
    setMenuDragging(true);
  };

  const handlePesanPointerDown = (clientX: number) => {
    dragRef.current = {
      startY: 0,
      startX: clientX,
      heightStart: 0,
      pesanStartOffset: pesanOffset,
    };
  };

  return (
    <div
      className="pullup-menu"
      style={{
        height: `${menuHeight}px`,
        transition: menuDragging ? "none" : "height 0.3s ease",
      }}
    >
      <div
        className="pullup-handle"
        onMouseDown={(e) => handleMenuPointerDown(e.clientY)}
        onTouchStart={(e) => handleMenuPointerDown(e.touches[0].clientY)}
      />

      <div
        className="pullup-content"
        onMouseDown={(e) => handleMenuPointerDown(e.clientY)}
        onTouchStart={(e) => handleMenuPointerDown(e.touches[0].clientY)}
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
          <button
            className={`btn-dispatch${pesanExpanded ? " expanded" : ""}`}
            style={{
              transform: `translateX(-${pesanOffset}px)`,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handlePesanPointerDown(e.clientX);
            }}
            onTouchStart={(e) => {
              handlePesanPointerDown(e.touches[0].clientX);
            }}
          >
            Pesan
          </button>
        </div>
      )}
    </div>
  );
}
