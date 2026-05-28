'use client';

import React from 'react';
import { OrderLineImage } from '@/components/Order/OrderLineImage';
import { formatOrderPurchaseDate } from '@/lib/order-display';
import { formatOrderStatus, getOrderStatusBadgeVariant } from '@/lib/order-status';
import { Badge } from '@/components/ui/badge';

export type OrderDetailItem = {
  id: number;
  product_name?: string;
  name?: string;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
  product_image_url?: string | null;
  product?: { name?: string; image_url?: string | null };
};

function getItemProductName(item: OrderDetailItem): string {
  return item.product?.name ?? item.product_name ?? item.name ?? 'Artikal';
}

function getItemImageUrl(item: OrderDetailItem): string | undefined {
  return item.product_image_url ?? item.product?.image_url ?? undefined;
}

interface OrderSummaryPanelProps {
  orderNumber: string;
  createdAt: string | Date;
  totalPrice: number;
  status: string;
}

export function OrderSummaryPanel({
  orderNumber,
  createdAt,
  totalPrice,
  status,
}: OrderSummaryPanelProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border/50 bg-muted/10 p-4">
      <div className="space-y-2">
        <p className="font-serif text-lg font-semibold text-primary">Porudžbina #{orderNumber}</p>
        <p className="text-sm text-muted-foreground">Datum: {formatOrderPurchaseDate(createdAt)}</p>
        <p className="text-sm font-medium">Ukupno: €{totalPrice.toFixed(2)}</p>
      </div>
      <Badge variant={getOrderStatusBadgeVariant(status)}>{formatOrderStatus(status)}</Badge>
    </div>
  );
}

interface OrderItemsListProps {
  items: OrderDetailItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Artikli</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/80 px-3 py-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <OrderLineImage
                src={getItemImageUrl(item)}
                alt={getItemProductName(item)}
                size="md"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">{getItemProductName(item)}</p>
                <p className="text-sm text-muted-foreground">
                  Kol: {item.quantity}
                  {item.size ? <span className="ml-3">Veličina: {item.size}</span> : null}
                </p>
                {item.color ? (
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Boja:</span>
                    <span
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: item.color || '#FFFFFF' }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold">€{item.price.toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface OrderInfoPanelProps {
  label: string;
  children: React.ReactNode;
}

export function OrderInfoPanel({ label, children }: OrderInfoPanelProps) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/80 p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}
