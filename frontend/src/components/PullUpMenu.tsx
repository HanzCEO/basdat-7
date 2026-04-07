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
  const [pesanOffset, setPesanOffset] = useState(0);
  const [isPesanExpanded, setIsPesanExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { totalItems, totalPrice } = useCart();
  
  const dragState = useRef({
    type: "" as "" | "menu" | "pesan",
    startY: 0,
    startX: 0,
    heightStart: COLLAPSED_HEIGHT,
    pesanStartOffset: 0,
  });

  const handleDragMove = useCallback((clientY: number, clientX: number) => {
    if (dragState.current.type === "menu") {
      const delta = dragState.current.startY - clientY;
      const newHeight = dragState.current.heightStart + delta;
      const clamped = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
      setMenuHeight(clamped);
    } else if (dragState.current.type === "pesan") {
      const delta = dragState.current.startX - clientX;
      const newOffset = Math.max(0, dragState.current.pesanStartOffset + delta);
      setPesanOffset(newOffset);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragState.current.type === "menu") {
      setMenuHeight((current) => {
        if (current < COLLAPSED_HEIGHT + 50) {
          if (current < COLLAPSED_HEIGHT / 2) {
            onClose();
          }
          return COLLAPSED_HEIGHT;
        } else {
          return EXPANDED_HEIGHT;
        }
      });
    } else if (dragState.current.type === "pesan") {
      const barWidth = 420;
      const threshold = barWidth * 0.7;
      if (pesanOffset > threshold) {
        setIsPesanExpanded(true);
        setTimeout(() => {
          onDispatch();
          setIsPesanExpanded(false);
          setPesanOffset(0);
        }, 150);
      } else {
        setPesanOffset(0);
      }
    }
    dragState.current.type = "";
    setIsDragging(false);
  }, [pesanOffset, onClose, onDispatch]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY, e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      handleDragMove(e.touches[0].clientY, e.touches[0].clientX);
      if (dragState.current.type === "menu") {
        e.preventDefault();
      }
    };

    const onMouseUp = () => {
      handleDragEnd();
    };

    const onTouchEnd = () => {
      handleDragEnd();
    };

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

  const handleMenuPointerDown = (clientY: number) => {
    dragState.current = {
      type: "menu",
      startY: clientY,
      startX: 0,
      heightStart: menuHeight,
      pesanStartOffset: 0,
    };
    setIsDragging(true);
  };

  const handlePesanPointerDown = (clientX: number) => {
    dragState.current = {
      type: "pesan",
      startY: 0,
      startX: clientX,
      heightStart: 0,
      pesanStartOffset: pesanOffset,
    };
    setIsDragging(true);
  };

  return (
    <div
      className="pullup-menu"
      style={{
        height: `${menuHeight}px`,
        transition: isDragging ? "none" : "all 0.3s ease",
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
            className={`btn-dispatch${isPesanExpanded ? " expanded" : ""}`}
            style={{
              transform: `translateX(-${pesanOffset}px)`,
              transition: isDragging && dragState.current.type === "pesan" ? "none" : "transform 0.3s ease",
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
