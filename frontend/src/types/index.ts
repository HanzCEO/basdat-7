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
}
