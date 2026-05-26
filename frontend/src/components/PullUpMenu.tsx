import { useState, useRef, useCallback, useEffect } from "react";
import { Restaurant, Driver } from "../types";
import { getTracking } from "../services/api";
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
  pesananId: number | null;
  isDispatching: boolean;
  isVisible: boolean;
}

const STAGE_LABELS: Record<string, string> = {
  menunggu_konfirmasi: "Pesanan Diterima",
  driver_ditugaskan: "Mencarikan Driver",
  menuju_restoran: "Driver Menuju Restoran",
  sampai_restoran: "Sampai di Restoran",
  menuju_pelanggan: "Dalam Perjalanan",
  selesai: "Selesai",
};

const STAGE_ORDER = [
  "menunggu_konfirmasi",
  "driver_ditugaskan",
  "menuju_restoran",
  "sampai_restoran",
  "menuju_pelanggan",
  "selesai",
];

export default function PullUpMenu({ restaurant, onClose, onDispatch, phase, driver, pesananId, isDispatching, isVisible }: PullUpMenuProps) {
  const [menuHeight, setMenuHeight] = useState(COLLAPSED_HEIGHT);
  const [isMenuDragging, setIsMenuDragging] = useState(false);
  const [isPesanDragging, setIsPesanDragging] = useState(false);
  const [pesanOffset, setPesanOffset] = useState(0);
  const [trackingDriver, setTrackingDriver] = useState<Driver | null>(null);
  const [currentStage, setCurrentStage] = useState("");
  const { totalItems, totalPrice, items, pendingItem, confirmPendingItem, cancelPendingItem } = useCart();

  useEffect(() => {
    setMenuHeight(COLLAPSED_HEIGHT);
  }, [restaurant.id, phase]);

  useEffect(() => {
    if (phase !== 'delivery' || !pesananId) return;

    const fetchTracking = async () => {
      try {
        const data = await getTracking(pesananId);
        const p = data.pengiriman;
        if (p) {
          setTrackingDriver({
            id: String(p.driver_id || ""),
            name: p.driver_nama || "",
            vehicle: "",
            plateNumber: "",
            rating: 0,
          });
          setCurrentStage(p.status_pengiriman || "menunggu_konfirmasi");
        } else {
          setCurrentStage("menunggu_konfirmasi");
        }
      } catch {
        // ignore
      }
    };

    fetchTracking();
    const poll = setInterval(fetchTracking, 3000);
    return () => clearInterval(poll);
  }, [phase, pesananId]);

  const existingRestaurantName = items[0]?.restaurantName ?? "";

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

  const activeDriver = trackingDriver || driver;
  const stageIndex = STAGE_ORDER.indexOf(currentStage);

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

        {phase === 'delivery' && (
          <div className="delivery-content">
            <header className="pullup-header">
              <div className="pullup-info">
                <h2>Pengiriman</h2>
                <p>{restaurant.name}</p>
              </div>
              <button className="btn-close" onClick={onClose}>&times;</button>
            </header>

            {activeDriver && (
              <div className="driver-profile">
                <div className="driver-avatar">{activeDriver.name.charAt(0)}</div>
                <div className="driver-details">
                  <span className="driver-name">{activeDriver.name}</span>
                  <span className="driver-vehicle">{activeDriver.vehicle}</span>
                  <span className="driver-rating">Rating: {activeDriver.rating}</span>
                </div>
              </div>
            )}

            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${stageIndex >= 0 ? (stageIndex / (STAGE_ORDER.length - 1)) * 100 : 0}%` }}
              />
            </div>

            <div className="delivery-progress">
              {STAGE_ORDER.map((key, i) => {
                const cls = i < stageIndex ? "completed" : i === stageIndex ? "active" : "pending";
                return (
                  <div key={key} className={`progress-step ${cls}`}>
                    <div className="progress-step-indicator">
                      {i < stageIndex ? '\u2713' : '\u25CF'}
                    </div>
                    <span className="progress-step-label">{STAGE_LABELS[key]}</span>
                  </div>
                );
              })}
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
              width: isDispatching ? undefined : pesanWidth,
              borderRadius: isPesanDragging && pesanOffset >= dragRef.current.dispatchThreshold ? 0 : undefined,
              zIndex: isPesanDragging ? 10 : 2,
            }}
            disabled={isDispatching}
            onMouseDown={(e) => {
              if (isDispatching) return;
              e.preventDefault();
              handlePesanPointerDown(e.clientX);
            }}
            onTouchStart={(e) => {
              if (isDispatching) return;
              handlePesanPointerDown(e.touches[0].clientX);
            }}
          >
            {isDispatching ? "Memproses..." : "Pesan"}
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
