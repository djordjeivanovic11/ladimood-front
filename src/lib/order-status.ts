export const ORDER_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Kreirano',
  PENDING: 'Na čekanju',
  SHIPPED: 'Poslato',
  DELIVERED: 'Dostavljeno',
  CANCELLED: 'Otkazano',
};

export function formatOrderStatus(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getOrderStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'DELIVERED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    case 'SHIPPED':
    case 'PENDING':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function formatPaymentMethod(method?: string | null): string {
  if (method === 'COD') return 'Gotovinski, po dostavi';
  return method ?? '—';
}
