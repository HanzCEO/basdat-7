import { Restaurant, MenuItem, Driver } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

function mapMenu(item: any): MenuItem {
  return {
    id: String(item.id),
    name: item.nama,
    description: item.deskripsi || "",
    price: Number(item.harga),
    isRecommended: false,
    isOutOfStock: item.is_available === 0,
  };
}

function mapRestaurant(r: any): Restaurant {
  return {
    id: String(r.id),
    name: r.nama,
    cuisine: "",
    rating: Number(r.rating),
    lat: Number(r.latitude),
    lng: Number(r.longitude),
    menu: (r.menu || []).map(mapMenu),
  };
}

function mapDriver(d: any): Driver {
  return {
    id: String(d.id),
    name: d.nama,
    vehicle: d.jenis_kendaraan,
    plateNumber: d.no_plat,
    rating: Number(d.rating),
  };
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const json = await fetchApi<{ data: any[] }>("/restoran");
  return json.data.map(mapRestaurant);
}

export async function getRestaurant(id: number): Promise<Restaurant> {
  const json = await fetchApi<{ data: any }>(`/restoran/${id}`);
  return mapRestaurant(json.data);
}

export async function getPelanggan(): Promise<any[]> {
  const json = await fetchApi<{ data: any[] }>("/pelanggan");
  return json.data;
}

export interface CreatePesananBody {
  pelanggan_id: number;
  restoran_id: number;
  alamat_pengiriman: string;
  catatan: string;
  items: { menu_id: number; qty: number }[];
}

export async function createPesanan(data: CreatePesananBody) {
  return fetchApi<{ pesanan_id: number; total: number; message: string }>("/pesanan", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function assignDriver(pesananId: number) {
  return fetchApi<{ message: string; driver_id: number }>(`/assign-driver/${pesananId}`, {
    method: "POST",
  });
}

export async function startPengiriman(pesananId: number) {
  return fetchApi<{ message: string }>(`/pengiriman/${pesananId}`, {
    method: "POST",
  });
}

export async function getTracking(pesananId: number) {
  return fetchApi<{
    pesanan: any;
    menu: any[];
    pengiriman: any | null;
  }>(`/tracking/${pesananId}`);
}

export async function getAvailableDrivers(): Promise<Driver[]> {
  const json = await fetchApi<any[]>("/driver/available");
  return json.map(mapDriver);
}
