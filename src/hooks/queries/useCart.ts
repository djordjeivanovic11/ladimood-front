import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCart,
  removeFromCart,
  getGuestCart,
  addToGuestCart,
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
      return { items: [] };
    },
    enabled: isAuthenticated || !!guestSessionId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const guestSessionId = useCartStore((state) => state.guestSessionId);

  return useMutation({
    mutationFn: async (item: CartItemCreate) => {
      if (isAuthenticated) {
        // For authenticated users, we need to convert CartItemCreate to the format expected by addToCart
        return addToGuestCart(guestSessionId ?? '', item);
      }
      if (guestSessionId) {
        return addToGuestCart(guestSessionId, item);
      }
      throw new Error('No cart session available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Added to cart!');
    },
    onError: () => {
      toast.error('Failed to add item to cart');
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
      throw new Error('No cart session available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Item removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

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
      // For now, this is a local-only update since we don't have a dedicated update endpoint
      return { itemId, quantity, color, size };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const guestSessionId = useCartStore((state) => state.guestSessionId);

  return useMutation({
    mutationFn: async () => {
      if (guestSessionId) {
        return clearGuestCart(guestSessionId);
      }
      // For authenticated users, we might need a different endpoint
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
