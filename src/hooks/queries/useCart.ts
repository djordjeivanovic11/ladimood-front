import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addToCart as addToUserCart,
  updateCartItem as updateUserCartItem,
  clearCart as clearUserCart,
  getCart,
  removeFromCart,
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
} from '@/api/account/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { toast } from '@/lib/toast';
import type { CartItemCreate, Size } from '@/app/types/types';

export const cartKeys = {
  all: ['cart'] as const,
  user: () => [...cartKeys.all, 'user'] as const,
  guest: (sessionId: string) => [...cartKeys.all, 'guest', sessionId] as const,
};

export function useCartQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);
  const guestSessionId = useCartStore((state) => state.guestSessionId);

  return useQuery({
    queryKey: isAuthenticated ? cartKeys.user() : cartKeys.guest(guestSessionId ?? ''),
    queryFn: async () => {
      if (isAuthenticated) {
        return getCart();
      }
      if (guestSessionId) {
        return getGuestCart(guestSessionId);
      }
      return { id: 0, user_id: 0, items: [] };
    },
    enabled: !authLoading && (isAuthenticated || !!guestSessionId),
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const guestSessionId = useCartStore((state) => state.guestSessionId);

  return useMutation({
    mutationFn: async (item: CartItemCreate) => {
      if (isAuthenticated) {
        return addToUserCart(item);
      }
      if (guestSessionId) {
        return addToGuestCart(guestSessionId, item);
      }
      throw new Error('Sesija korpe nije dostupna');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Added to cart!');
    },
    onError: () => {
      toast.error('Dodavanje u korpu nije uspjelo');
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const guestSessionId = useCartStore((state) => state.guestSessionId);

  return useMutation({
    mutationFn: async ({ itemId, color, size }: { itemId: number; color: string; size: Size }) => {
      if (isAuthenticated) {
        return removeFromCart(itemId, color, size);
      }
      if (guestSessionId) {
        return removeFromGuestCart(guestSessionId, itemId);
      }
      throw new Error('Sesija korpe nije dostupna');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Item removed from cart');
    },
    onError: () => {
      toast.error('Uklanjanje artikla nije uspjelo');
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const guestSessionId = useCartStore((state) => state.guestSessionId);

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
      color,
      size,
    }: {
      itemId: number;
      quantity: number;
      color: string;
      size: Size;
    }) => {
      if (isAuthenticated) {
        return updateUserCartItem({ id: itemId, quantity, color, size });
      }
      if (guestSessionId) {
        return updateGuestCartItem(guestSessionId, itemId, quantity, color, size);
      }
      throw new Error('Sesija korpe nije dostupna');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const guestSessionId = useCartStore((state) => state.guestSessionId);

  return useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        return clearUserCart();
      }
      if (guestSessionId) {
        return clearGuestCart(guestSessionId);
      }
      throw new Error('Sesija korpe nije dostupna');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
