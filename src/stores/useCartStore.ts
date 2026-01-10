import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/app/types/types';

interface CartState {
  items: CartItem[];
  guestSessionId: string | null;
  isCartOpen: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number, color: string, size: string) => void;
  updateQuantity: (itemId: number, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  setGuestSession: (sessionId: string) => void;
  clearGuestSession: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed (as functions for Zustand)
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      guestSessionId: null,
      isCartOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product.id === item.product.id && i.color === item.color && i.size === item.size
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (itemId, color, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === itemId && item.color === color && item.size === size)
          ),
        })),

      updateQuantity: (itemId, color, size, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId && item.color === color && item.size === size
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      setGuestSession: (sessionId) => set({ guestSessionId: sessionId }),

      clearGuestSession: () => set({ guestSessionId: null }),

      openCart: () => set({ isCartOpen: true }),

      closeCart: () => set({ isCartOpen: false }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        guestSessionId: state.guestSessionId,
      }),
    }
  )
);

// Selector hooks
export const useCartItems = () => useCartStore((state) => state.items);
export const useIsCartOpen = () => useCartStore((state) => state.isCartOpen);
export const useGuestSessionId = () => useCartStore((state) => state.guestSessionId);
