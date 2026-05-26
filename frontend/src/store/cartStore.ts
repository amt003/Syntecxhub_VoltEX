import { create } from "zustand";

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
  stock?: number;
}

interface CartStore {
  items: CartItem[];
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCart: (items: CartItem[], totalPrice: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  totalPrice: 0,
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
      return {
        items: [...state.items],
        totalPrice: state.items.reduce(
          (total, i) => total + i.price * i.quantity,
          0,
        ),
      };
    }),
  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((i) => i.productId !== productId);
      return {
        items,
        totalPrice: items.reduce((total, i) => total + i.price * i.quantity, 0),
      };
    }),
  updateItem: (productId, quantity) =>
    set((state) => {
      const item = state.items.find((i) => i.productId === productId);
      if (item) {
        item.quantity = quantity;
      }
      return {
        items: [...state.items],
        totalPrice: state.items.reduce(
          (total, i) => total + i.price * i.quantity,
          0,
        ),
      };
    }),
  clearCart: () => set({ items: [], totalPrice: 0 }),
  setCart: (items, totalPrice) => set({ items, totalPrice }),
}));
