import { useState, useRef, useCallback, useEffect } from "react";
import { Restaurant, Driver } from "../types";
import MenuItem from "./MenuItem";
import { useCart } from "../context/CartContext";
import ConfirmDialog from "./ConfirmDialog";

const COLLAPSED_HEIGHT = 240;
const EXPANDED_HEIGHT = typeof window !== "undefined" ? window.innerHeight * 0.8 : 500;
const FULL_HEIGHT = typeof window !== "undefined" ? window.innerHeight - 50 : 700;

interface PullUpMenuProps {
  restaurant: Restaurant;
  onClose: () => void;
  onDispatch: () => void;
  phase: 'order' | 'delivery';
  driver: Driver | null;
  isVisible: boolean;
}

export default function PullUpMenu({ restaurant, onClose, onDispatch, phase, driver, isVisible }: PullUpMenuProps) {
  const [menuHeight, setMenuHeight] = useState(COLLAPSED_HEIGHT);
  const [isMenuDragging, setIsMenuDragging] = useState(false);
  const [isPesanDragging, setIsPesanDragging] = useState(false);
  const [pesanOffset, setPesanOffset] = useState(0);
  const { totalItems, totalPrice, items, pendingItem, confirmPendingItem, cancelPendingItem } = useCart();
  
  // Reset height when restaurant changes or phase goes to delivery
  useEffect(() => {
    setMenuHeight(COLLAPSED_HEIGHT);
  }, [restaurant.id, phase]);

  const existingRestaurantName = items[0] ? restaurant.name : "";
  
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
      const clamped = Math.max(COLLAPSED_HEIGHT, Math.min(FULL_HEIGHT, newHeight));
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
      setMenuHeight((height) => {
        if (height < COLLAPSED_HEIGHT + 50) {
          if (height < COLLAPSED_HEIGHT / 2) {
            onClose();
          }
          return COLLAPSED_HEIGHT;
        }
        if (height < EXPANDED_HEIGHT + 50) {
          return EXPANDED_HEIGHT;
        }
        return height;
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

  const recommendedItems = restaurant.menu.filter(item => item.isRecommended);
  const otherItems = restaurant.menu.filter(item => !item.isRecommended);

  const deliveryStages = [
    { key: 'received', label: 'Pesanan Diterima' },
    { key: 'finding', label: 'Mencarikan Driver' },
    { key: 'to_restaurant', label: 'Driver Menuju Restoran' },
    { key: 'on_way', label: 'Dalam Perjalanan' },
    { key: 'done', label: 'Selesai' },
  ];

  const [deliveryStageIndex, setDeliveryStageIndex] = useState(0);

  useEffect(() => {
    if (phase === 'delivery') {
      setDeliveryStageIndex(0);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'delivery') return;
    if (deliveryStageIndex >= deliveryStages.length - 1) return;
    const id = setInterval(() => {
      setDeliveryStageIndex((prev) => {
        if (prev >= deliveryStages.length - 1) {
          clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [phase, deliveryStageIndex, deliveryStages.length]);

  if (!isVisible) return null;

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
        {phase === 'order' && (
          <>
            <header className="pullup-header">
              <div className="pullup-info">
                <h2>{restaurant.name}</h2>
                <p>{restaurant.cuisine} • Rating: {restaurant.rating}</p>
              </div>
              <button className="btn-close" onClick={onClose}>&times;</button>
            </header>

            <div className="pullup-menu-list">
              {recommendedItems.length > 0 && (
                <>
                  {recommendedItems.map(item => (
                    <MenuItem key={item.id} item={item} restaurantId={restaurant.id} restaurantName={restaurant.name} isRecommended={!item.isOutOfStock} />
                  ))}
                  <div className="menu-section-divider" />
                </>
              )}
              {otherItems.map(item => (
                <MenuItem key={item.id} item={item} restaurantId={restaurant.id} restaurantName={restaurant.name} />
              ))}
            </div>
          </>
        )}

        {phase === 'delivery' && driver && (
          <div className="delivery-content">
            <header className="pullup-header">
              <div className="pullup-info">
                <h2>Pengiriman</h2>
                <p>{restaurant.name}</p>
              </div>
              <button className="btn-close" onClick={onClose}>&times;</button>
            </header>

            <div className="driver-profile">
              <div className="driver-avatar">{driver.name.charAt(0)}</div>
              <div className="driver-details">
                <span className="driver-name">{driver.name}</span>
                <span className="driver-vehicle">{driver.vehicle} - {driver.plateNumber}</span>
                <span className="driver-rating">Rating: {driver.rating}</span>
              </div>
            </div>

            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${(deliveryStageIndex / (deliveryStages.length - 1)) * 100}%` }}
              />
            </div>

            <div className="delivery-progress">
              <div className="progress-step active">
                <div className="progress-step-indicator">{'\u25CF'}</div>
                <span className="progress-step-label">{deliveryStages[deliveryStageIndex].label}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {phase === 'order' && totalItems > 0 && (
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
              borderRadius: isPesanDragging && pesanOffset >= dragRef.current.dispatchThreshold ? 0 : undefined,
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

      <ConfirmDialog
        isOpen={pendingItem !== null}
        title="Ganti Restaurant?"
        message={`Keranjang Anda berisi item dari ${existingRestaurantName}. Lanjut untuk menambahkan ${pendingItem?.restaurantName}?`}
        onConfirm={confirmPendingItem}
        onCancel={cancelPendingItem}
      />
    </div>
  );
}
