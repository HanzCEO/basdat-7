export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isRecommended?: boolean;
  isOutOfStock?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  lat: number;
  lng: number;
  menu: MenuItem[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface CartState {
  items: CartItem[];
  restaurantId: string | null;
}

export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  plateNumber: string;
  rating: number;
  lat?: number;
  lng?: number;
}

export interface AdminStats {
  total_drivers: number;
  total_restaurants: number;
  total_customers: number;
  available_drivers: number;
  busy_drivers: number;
  active_deliveries: number;
  avg_rating: number;
  total_deliveries: number;
  deliveries_today: number;
  total_orders: number;
  orders_today: number;
  total_revenue: number;
  revenue_today: number;
  avg_delivery_time: number;
  cancellation_rate: number;
  orders_by_status: { status: string; count: number }[];
  monthly_trend: { bulan: string; total: number }[];
  monthly_revenue: { bulan: string; revenue: number }[];
}

export interface AdminDriverSummary {
  id: number;
  nama: string;
  no_hp: string;
  jenis_kendaraan: string;
  no_plat: string;
  status: string;
  rating: number;
  total_pengiriman: number;
  created_at: string;
  total_distance: number;
  total_waktu_menit: number;
  delivery_count: number;
}

export interface AdminDriverDetail {
  driver: {
    id: number;
    nama: string;
    no_hp: string;
    jenis_kendaraan: string;
    no_plat: string;
    status: string;
    rating: number;
    total_pengiriman: number;
    total_jarak_km: number;
    total_waktu_menit: number;
    created_at: string;
  };
  monthly_performance: {
    bulan: string;
    deliveries: number;
    avg_distance: number;
    avg_time_minutes: number;
  }[];
  deliveries: {
    id: number;
    pesanan_status: string;
    total_harga: number;
    status_pengiriman: string;
    waktu_ditugaskan: string;
    waktu_pickup: string | null;
    waktu_sampai: string | null;
    jarak_km: number;
    dest_lat: number;
    dest_lng: number;
    restoran_nama: string;
    pelanggan_nama: string;
  }[];
}

export interface DriverPerformance {
  driver: {
    id: number;
    nama: string;
    rating: number;
    total_pengiriman: number;
    total_jarak_km: number;
    total_waktu_menit: number;
  };
  monthly: {
    bulan: string;
    deliveries: number;
    avg_delivery_minutes: number;
    total_distance: number;
  }[];
  status_distribution: {
    status_pengiriman: string;
    count: number;
  }[];
}

export interface DriverLocation {
  driver_id: number;
  nama: string;
  jenis_kendaraan: string;
  no_plat: string;
  status: string;
  rating: number;
  status_pengiriman: string;
  pesanan_id: number;
  lat: number;
  lng: number;
}

export interface OrderSummary {
  id: number;
  status: string;
  total_harga: number;
  alamat_pengiriman: string;
  created_at: string;
  pelanggan_nama: string;
  restoran_nama: string;
  driver_id: number | null;
  driver_nama: string | null;
  jenis_kendaraan: string | null;
  no_plat: string | null;
  status_pengiriman: string | null;
  waktu_ditugaskan: string | null;
  waktu_pickup: string | null;
  waktu_sampai: string | null;
}

export interface OrderDetail {
  pesanan: {
    id: number;
    pelanggan_id: number;
    restoran_id: number;
    driver_id: number | null;
    status: string;
    total_harga: number;
    alamat_pengiriman: string;
    catatan: string | null;
    created_at: string;
    pelanggan_nama: string;
    pelanggan_email: string;
    pelanggan_no_hp: string;
    pelanggan_alamat: string;
    restoran_nama: string;
    restoran_alamat: string;
    restoran_no_telp: string;
    restoran_rating: number;
  };
  driver: {
    id: number;
    nama: string;
    no_hp: string;
    jenis_kendaraan: string;
    no_plat: string;
    rating: number;
    status: string;
  } | null;
  pengiriman: {
    id: number;
    pesanan_id: number;
    driver_id: number;
    waktu_ditugaskan: string | null;
    waktu_pickup: string | null;
    waktu_sampai: string | null;
    jarak_km: number | null;
    status_pengiriman: string;
    dest_lat: number | null;
    dest_lng: number | null;
  } | null;
  items: {
    qty: number;
    harga_saat_pesan: number;
    subtotal: number;
    nama: string;
    deskripsi: string;
  }[];
}

export interface ActiveDelivery {
  pesanan_id: number;
  pesanan_status: string;
  total_harga: number;
  alamat_pengiriman: string;
  order_created: string;
  status_pengiriman: string;
  waktu_ditugaskan: string;
  waktu_pickup: string | null;
  dest_lat: number;
  dest_lng: number;
  jarak_km: number;
  driver_id: number;
  driver_nama: string;
  jenis_kendaraan: string;
  no_plat: string;
  driver_rating: number;
  restoran_nama: string;
  rest_lat: number;
  rest_lng: number;
  pelanggan_nama: string;
}
