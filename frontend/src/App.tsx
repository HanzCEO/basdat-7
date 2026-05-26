import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import { Restaurant, Driver } from "./types";
import { getRestaurants, getPelanggan, createPesanan, assignDriver, startPengiriman, updateDeliveryStatus } from "./services/api";
import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";
import PullUpMenu from "./components/PullUpMenu";
import Onboarding, { checkOnboardingCompleted } from "./components/Onboarding";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminPesanan from "./admin/AdminPesanan";
import AdminPesananDetail from "./admin/AdminPesananDetail";
import AdminDrivers from "./admin/AdminDrivers";
import AdminDriverDetail from "./admin/AdminDriverDetail";
import AdminLiveMap from "./admin/AdminLiveMap";
import AdminReports from "./admin/AdminReports";
import "./App.scss";

const DEFAULT_LOCATION = { lat: -6.2088, lng: 106.8456 };

function AppContent() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [phase, setPhase] = useState<'order' | 'delivery'>('order');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [pelangganId, setPelangganId] = useState<number | null>(null);
  const [pelangganAlamat, setPelangganAlamat] = useState("");
  const [pesananId, setPesananId] = useState<number | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [driverProgress, setDriverProgress] = useState<number | null>(null);
  const { items, clearCart } = useCart();
  const dispatchLock = useRef(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setUserLocation(DEFAULT_LOCATION);
      }
    );
  }, []);

  useEffect(() => {
    getRestaurants().then(setRestaurants).catch(console.error);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("pelanggan_id");
    if (stored) {
      setPelangganId(Number(stored));
      setPelangganAlamat(localStorage.getItem("pelanggan_alamat") || "");
    } else {
      getPelanggan().then((data) => {
        if (data.length > 0) {
          const p = data[0];
          setPelangganId(p.id);
          setPelangganAlamat(p.alamat);
          localStorage.setItem("pelanggan_id", String(p.id));
          localStorage.setItem("pelanggan_alamat", p.alamat);
        }
      }).catch(console.error);
    }
  }, []);

  const location = userLocation ?? DEFAULT_LOCATION;

  const filteredRestaurants = useMemo(() => {
    if (!searchQuery) return restaurants;
    return restaurants.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, restaurants]);

  const handleDispatch = useCallback(async () => {
    if (dispatchLock.current || !selectedRestaurant || !pelangganId) return;
    dispatchLock.current = true;
    setIsDispatching(true);

    try {
      const body = {
        pelanggan_id: pelangganId,
        restoran_id: Number(selectedRestaurant.id),
        alamat_pengiriman: pelangganAlamat,
        catatan: "",
        items: items.map((c) => ({ menu_id: Number(c.item.id), qty: c.quantity })),
      };
      const order = await createPesanan(body);
      await assignDriver(order.pesanan_id);
      await startPengiriman(order.pesanan_id, location.lat, location.lng);
      setPesananId(order.pesanan_id);
      setPhase('delivery');
      clearCart();
    } catch (err) {
      console.error("Dispatch failed:", err);
      alert("Gagal memproses pesanan. Silakan coba lagi.");
    } finally {
      setIsDispatching(false);
      dispatchLock.current = false;
    }
  }, [selectedRestaurant, pelangganId, pelangganAlamat, items, clearCart, location]);

  const handleClose = useCallback(() => {
    setSelectedRestaurant(null);
    setPhase('order');
    setDriver(null);
    setPesananId(null);
    setDriverProgress(null);
  }, []);

  useEffect(() => {
    if (phase !== 'delivery' || !pesananId || !selectedRestaurant) return;

    setDriverProgress(0);

    const MENUJU_DURATION = 5000;
    const PENGIRIMAN_DURATION = 15000;
    const startTime = Date.now();
    let advancedToPengiriman = false;
    let advancedToSelesai = false;

    const tick = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < MENUJU_DURATION) {
        setDriverProgress(0);
      } else if (elapsed < MENUJU_DURATION + PENGIRIMAN_DURATION) {
        if (!advancedToPengiriman) {
          advancedToPengiriman = true;
          updateDeliveryStatus(pesananId, 'dalam_pengiriman').catch(() => {});
        }
        setDriverProgress((elapsed - MENUJU_DURATION) / PENGIRIMAN_DURATION);
      } else {
        if (!advancedToSelesai) {
          advancedToSelesai = true;
          updateDeliveryStatus(pesananId, 'selesai').catch(() => {});
        }
        setDriverProgress(1);
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, [phase, pesananId]);

  return (
    <div className="app">
      <div className="search-container">
        <SearchBar onSearch={setSearchQuery} />
      </div>
      <MapView
        userLocation={location}
        restaurants={filteredRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={setSelectedRestaurant}
        phase={phase}
        driverProgress={driverProgress}
      />
      <PullUpMenu
        restaurant={selectedRestaurant || { id: "", name: "", cuisine: "", rating: 0, lat: 0, lng: 0, menu: [] }}
        onClose={handleClose}
        onDispatch={handleDispatch}
        phase={phase}
        driver={driver}
        pesananId={pesananId}
        isDispatching={isDispatching}
        isVisible={!!selectedRestaurant}
      />
    </div>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setShowOnboarding(!checkOnboardingCompleted());
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <CartProvider>
      <Routes>
        <Route
          path="/"
          element={
            showOnboarding ? (
              <Onboarding onComplete={handleOnboardingComplete} />
            ) : (
              <AppContent />
            )
          }
        />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="pesanan" element={<AdminPesanan />} />
          <Route path="pesanan/:id" element={<AdminPesananDetail />} />
          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="drivers/:id" element={<AdminDriverDetail />} />
          <Route path="map" element={<AdminLiveMap />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;
