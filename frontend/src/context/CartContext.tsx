import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { CartItem, MenuItem } from "../types";

interface PendingItem {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
}

interface CartContextType {
  items: CartItem[];
  pendingItem: PendingItem | null;
  addItem: (item: MenuItem, restaurantId: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setPendingItem: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
  confirmPendingItem: () => void;
  cancelPendingItem: () => void;
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { item: MenuItem; restaurantId: string } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "SET_PENDING_ITEM"; payload: PendingItem }
  | { type: "CLEAR_PENDING" };

interface CartState {
  items: CartItem[];
  pendingItem: PendingItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((c) => c.item.id === action.payload.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((c) =>
            c.item.id === action.payload.item.id
              ? { ...c, quantity: c.quantity + 1 }
              : c
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { item: action.payload.item, quantity: 1, restaurantId: action.payload.restaurantId },
        ],
      };
    }
    case "REMOVE_ITEM": {
      const existing = state.items.find((c) => c.item.id === action.payload);
      if (existing && existing.quantity > 1) {
        return {
          ...state,
          items: state.items.map((c) =>
            c.item.id === action.payload ? { ...c, quantity: c.quantity - 1 } : c
          ),
        };
      }
      return {
        ...state,
        items: state.items.filter((c) => c.item.id !== action.payload),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "LOAD_CART":
      return { ...state, items: action.payload };
    case "SET_PENDING_ITEM":
      return { ...state, pendingItem: action.payload };
    case "CLEAR_PENDING":
      return { ...state, pendingItem: null };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], pendingItem: null });

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      dispatch({ type: "LOAD_CART", payload: JSON.parse(saved) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: MenuItem, restaurantId: string) => {
    dispatch({ type: "ADD_ITEM", payload: { item, restaurantId } });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const setPendingItem = (item: MenuItem, restaurantId: string, restaurantName: string) => {
    dispatch({ type: "SET_PENDING_ITEM", payload: { item, restaurantId, restaurantName } });
  };

  const confirmPendingItem = () => {
    if (state.pendingItem) {
      dispatch({ type: "CLEAR_CART" });
      dispatch({
        type: "ADD_ITEM",
        payload: {
          item: state.pendingItem.item,
          restaurantId: state.pendingItem.restaurantId,
        },
      });
      dispatch({ type: "CLEAR_PENDING" });
    }
  };

  const cancelPendingItem = () => {
    dispatch({ type: "CLEAR_PENDING" });
  };

  const totalItems = state.items.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = state.items.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        pendingItem: state.pendingItem,
        addItem,
        removeItem,
        clearCart,
        setPendingItem,
        confirmPendingItem,
        cancelPendingItem,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}