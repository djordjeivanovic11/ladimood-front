import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUserOrders,
  createGuestOrder,
  getOrderById,
  getGuestOrderByToken,
} from '@/api/account/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { toast } from '@/lib/toast';
import { isUnauthorizedError } from '@/lib/http-error';
import { getOrderDisplayNumber } from '@/lib/order-display';
import type { GuestOrderCreate } from '@/api/account/axios';

export const orderKeys = {
  all: ['orders'] as const,
  list: () => [...orderKeys.all, 'list'] as const,
  detail: (orderId: string, accessToken?: string | null) =>
    [...orderKeys.all, 'detail', orderId, accessToken ?? 'auth'] as const,
};

export function useOrdersQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);

  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: getUserOrders,
    enabled: !authLoading && isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error)) return false;
      return failureCount < 1;
    },
  });
}

export function useOrderQuery(orderId: string, accessToken?: string | null) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);
  const hasGuestToken = Boolean(accessToken?.trim());

  return useQuery({
    queryKey: orderKeys.detail(orderId, accessToken),
    queryFn: () =>
      hasGuestToken ? getGuestOrderByToken(orderId, accessToken as string) : getOrderById(orderId),
    enabled: !!orderId && (hasGuestToken || (!authLoading && isAuthenticated)),
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      if (!hasGuestToken && isUnauthorizedError(error)) return false;
      return failureCount < 1;
    },
  });
}

// Aliases for backwards compatibility
export const useUserOrdersQuery = useOrdersQuery;
export const useOrderByIdQuery = useOrderQuery;

export function useCreateGuestOrder() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);
  const clearGuestSession = useCartStore((state) => state.clearGuestSession);

  return useMutation({
    mutationFn: async (orderData: GuestOrderCreate) => {
      return createGuestOrder(orderData);
    },
    onSuccess: (order) => {
      clearCart();
      clearGuestSession();
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      try {
        localStorage.setItem('lastOrder', JSON.stringify(order));
        localStorage.setItem('lastGuestOrder', JSON.stringify(order));
      } catch {
        // ignore
      }
      toast.success(`Porudžbina #${getOrderDisplayNumber(order)} je uspješno poslata!`);
      return order;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Slanje porudžbine nije uspjelo');
    },
  });
}
