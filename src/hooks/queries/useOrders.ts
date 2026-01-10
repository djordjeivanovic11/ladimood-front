import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserOrders, createGuestOrder, getOrderById } from '@/api/account/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { toast } from '@/lib/toast';
import type { GuestOrderCreate } from '@/api/account/axios';

export const orderKeys = {
  all: ['orders'] as const,
  list: () => [...orderKeys.all, 'list'] as const,
  detail: (orderId: string) => [...orderKeys.all, 'detail', orderId] as const,
};

export function useOrdersQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: getUserOrders,
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useOrderQuery(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 60 * 1000,
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
        localStorage.setItem('lastGuestOrder', JSON.stringify(order));
      } catch {
        // ignore
      }
      toast.success(`Order #${order.id} placed successfully!`);
      return order;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place order');
    },
  });
}
