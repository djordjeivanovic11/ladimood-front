export type SuccessOrderLineItem = {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  size: string;
  image?: string;
};

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
    return String(order.order_number);
  }
  if (order.plain_id) {
    return order.plain_id;
  }
  return String(order.id ?? '');
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
