import { useState, useRef } from "react";
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
  const { totalItems, totalPrice } = useCart();
  
  const dragState = useRef({
    type: "" as "" | "menu" | "pesan",
    startY: 0,
    startX: 0,
    heightStart: COLLAPSED_HEIGHT,
    pesanStartOffset: 0,
  });

  const onMouseMove = (e: MouseEvent) => {
    if (dragState.current.type === "menu") {
      const delta = dragState.current.startY - e.clientY;
      const newHeight = dragState.current.heightStart + delta;
      const clamped = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
      setMenuHeight(clamped);
    } else if (dragState.current.type === "pesan") {
      const delta = dragState.current.startX - e.clientX;
      const newOffset = Math.max(0, dragState.current.pesanStartOffset + delta);
      setPesanOffset(newOffset);
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 0) return;
    if (dragState.current.type === "menu") {
      const delta = dragState.current.startY - e.touches[0].clientY;
      const newHeight = dragState.current.heightStart + delta;
      const clamped = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
      setMenuHeight(clamped);
      e.preventDefault();
    } else if (dragState.current.type === "pesan") {
      const delta = dragState.current.startX - e.touches[0].clientX;
      const newOffset = Math.max(0, dragState.current.pesanStartOffset + delta);
      setPesanOffset(newOffset);
    }
  };

  const onMouseUp = () => {
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
  };

  const onTouchEnd = () => {
    onMouseUp();
  };

  const handleMenuPointerDown = (clientY: number) => {
    dragState.current = {
      type: "menu",
      startY: clientY,
      startX: 0,
      heightStart: menuHeight,
      pesanStartOffset: 0,
    };
  };

  const handlePesanPointerDown = (clientX: number) => {
    dragState.current = {
      type: "pesan",
      startY: 0,
      startX: clientX,
      heightStart: 0,
      pesanStartOffset: pesanOffset,
    };
  };

  const isDragging = dragState.current.type !== "";

  return (
    <div
      className="pullup-menu"
      style={{
        height: `${menuHeight}px`,
        transition: isDragging ? "none" : "all 0.3s ease",
      }}
      onMouseMove={onMouseMove as unknown as React.MouseEventHandler}
      onTouchMove={onTouchMove as unknown as React.TouchEventHandler}
      onMouseUp={onMouseUp as unknown as React.MouseEventHandler}
      onTouchEnd={onTouchEnd as unknown as React.TouchEventHandler}
    >
      <div
        className="pullup-handle"
        onMouseDown={(e) => handleMenuPointerDown(e.clientY)}
        onTouchStart={(e) => handleMenuPointerDown(e.touches[0].clientY)}
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
