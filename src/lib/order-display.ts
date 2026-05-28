export type SuccessOrderLineItem = {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  size: string;
  image?: string;
};

export function formatOrderCode(value: number | string | undefined | null): string {
  if (value == null) return '';
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return String(Math.trunc(numeric)).padStart(6, '0');
  }
  return String(value);
}

type OrderItemLike = {
  product_id: number;
  product_name?: string;
  name?: string;
  quantity: number;
  price: number;
  size?: string | null;
  product_image_url?: string | null;
  image?: string;
  product?: { image_url?: string | null };
};

export function getOrderDisplayNumber(order: {
  order_number?: number;
  plain_id?: string;
  id?: string | number;
}): string {
  if (order.order_number != null) {
    return formatOrderCode(order.order_number);
  }
  if (order.plain_id) {
    return order.plain_id;
  }
  return formatOrderCode(order.id);
}

export function formatOrderPurchaseDate(createdAt: string | Date): string {
  return new Date(createdAt).toLocaleDateString('sr-ME', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatOrderAddress(
  address?: {
    street_address: string;
    city: string;
    state?: string | null;
    postal_code?: string;
    country: string;
  } | null
): string {
  if (!address) return 'Adresa nije dostupna';

  const parts = [
    address.street_address,
    [address.city, address.postal_code].filter(Boolean).join(' '),
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
}

export function mapOrderItemsToDisplay(items: OrderItemLike[]): SuccessOrderLineItem[] {
  return items.map((item) => ({
    product_id: item.product_id,
    name: item.product_name ?? item.name ?? 'Proizvod',
    quantity: item.quantity,
    price: item.price,
    size: item.size ?? '',
    image: item.product_image_url ?? item.image ?? item.product?.image_url ?? undefined,
  }));
}
