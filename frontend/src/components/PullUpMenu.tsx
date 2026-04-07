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
  const [isMenuDragging, setIsMenuDragging] = useState(false);
  const [isPesanDragging, setIsPesanDragging] = useState(false);
  const [pesanOffset, setPesanOffset] = useState(0);
  const { totalItems, totalPrice } = useCart();
  
  const dragRef = useRef({
    startY: 0,
    startX: 0,
    heightStart: COLLAPSED_HEIGHT,
    pesanStartOffset: 0,
    dispatchThreshold: 0,
  });
  const pesanButtonRef = useRef<HTMLButtonElement>(null);
  const originalWidthRef = useRef(0);
  const containerWidthRef = useRef(0);

  const handlePointerMove = useCallback((clientY: number, clientX: number) => {
    if (isMenuDragging) {
      const delta = dragRef.current.startY - clientY;
      const newHeight = dragRef.current.heightStart + delta;
      const clamped = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
      setMenuHeight(clamped);
    }

    if (isPesanDragging) {
      const delta = dragRef.current.startX - clientX;
      const newOffset = Math.max(0, dragRef.current.pesanStartOffset + delta);
      setPesanOffset(newOffset);
    }
  }, [isMenuDragging, isPesanDragging]);

  const handlePointerUp = useCallback(() => {
    if (isMenuDragging) {
      setMenuHeight((current) => {
        if (current < COLLAPSED_HEIGHT + 50) {
          if (current < COLLAPSED_HEIGHT / 2) {
            onClose();
          }
          return COLLAPSED_HEIGHT;
        }
        return EXPANDED_HEIGHT;
      });
      setIsMenuDragging(false);
    }

    if (isPesanDragging) {
      if (pesanOffset >= dragRef.current.dispatchThreshold) {
        onDispatch();
      }
      setPesanOffset(0);
      setIsPesanDragging(false);
    }

    dragRef.current = { startY: 0, startX: 0, heightStart: COLLAPSED_HEIGHT, pesanStartOffset: 0, dispatchThreshold: 0 };
  }, [isMenuDragging, isPesanDragging, pesanOffset, onClose, onDispatch]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientY, e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      handlePointerMove(e.touches[0].clientY, e.touches[0].clientX);
      if (isMenuDragging || isPesanDragging) {
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
  }, [handlePointerMove, handlePointerUp, isMenuDragging, isPesanDragging]);

  const handleMenuPointerDown = (clientY: number) => {
    dragRef.current = {
      startY: clientY,
      startX: 0,
      heightStart: menuHeight,
      pesanStartOffset: 0,
      dispatchThreshold: 0,
    };
    setIsMenuDragging(true);
  };

  const handlePesanPointerDown = (clientX: number) => {
    if (pesanButtonRef.current) {
      originalWidthRef.current = pesanButtonRef.current.offsetWidth;
      containerWidthRef.current = pesanButtonRef.current.parentElement?.clientWidth || 420;
    }
    dragRef.current = {
      startY: 0,
      startX: clientX,
      heightStart: 0,
      pesanStartOffset: pesanOffset,
      dispatchThreshold: containerWidthRef.current - originalWidthRef.current,
    };
    setIsPesanDragging(true);
  };

  const pesanWidth = isPesanDragging ? originalWidthRef.current + pesanOffset : undefined;

  return (
    <div
      className="pullup-menu"
      style={{
        height: `${menuHeight}px`,
        transition: isMenuDragging ? "none" : "height 0.3s ease",
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
            ref={pesanButtonRef}
            className="btn-dispatch"
            style={{
              position: isPesanDragging ? "absolute" : "relative",
              right: 0,
              width: pesanWidth,
              borderRadius: isPesanDragging && pesanOffset >= dragRef.current.dispatchThreshold ? 0 : 8,
              zIndex: isPesanDragging ? 10 : 2,
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
