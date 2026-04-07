import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { CartItem, MenuItem } from "../types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, restaurantId: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { item: MenuItem; restaurantId: string } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((c) => c.item.id === action.payload.item.id);
      if (existing) {
        return state.map((c) =>
          c.item.id === action.payload.item.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        ...state,
        { item: action.payload.item, quantity: 1, restaurantId: action.payload.restaurantId },
      ];
    }
    case "REMOVE_ITEM": {
      const existing = state.find((c) => c.item.id === action.payload);
      if (existing && existing.quantity > 1) {
        return state.map((c) =>
          c.item.id === action.payload ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return state.filter((c) => c.item.id !== action.payload);
    }
    case "CLEAR_CART":
      return [];
    case "LOAD_CART":
      return action.payload;
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      dispatch({ type: "LOAD_CART", payload: JSON.parse(saved) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: MenuItem, restaurantId: string) => {
    dispatch({ type: "ADD_ITEM", payload: { item, restaurantId } });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const totalItems = items.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = items.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
