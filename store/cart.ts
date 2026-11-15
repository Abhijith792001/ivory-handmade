"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((s) => {
          // Merge identical plain products; custom frames/gifts are always unique lines.
          if (item.kind === "product") {
            const existing = s.items.find((i) => i.key === item.key);
            if (existing) {
              return {
                isOpen: true,
                items: s.items.map((i) => (i.key === item.key ? { ...i, quantity: Math.min(20, i.quantity + item.quantity) } : i)),
              };
            }
          }
          return { items: [...s.items, item], isOpen: true };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setQuantity: (key, qty) =>
        set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(20, qty)) } : i)) })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "ivory-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    }
  )
);

export const cartSubtotal = (items: CartItem[]) => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0);
