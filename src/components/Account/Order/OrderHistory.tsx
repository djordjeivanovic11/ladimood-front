'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList, Package } from 'lucide-react';
import { useUserOrdersQuery } from '@/hooks/queries/useOrders';
import { OrderItem } from '@/app/types/types';
import { OrderLineImage } from '@/components/Order/OrderLineImage';
import { AccountSectionHeader } from '@/components/Account/AccountSectionHeader';
import { getOrderDisplayNumber, formatOrderPurchaseDate } from '@/lib/order-display';
import { formatOrderStatus, getOrderStatusBadgeVariant } from '@/lib/order-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { isUnauthorizedError } from '@/lib/http-error';

function OrderHistorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="border-border/60 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getItemProductName(item: OrderItem): string {
  return item.product?.name ?? item.product_name ?? 'Artikal';
}

function getItemImageUrl(item: OrderItem): string | undefined {
  return item.product_image_url ?? item.product?.image_url ?? undefined;
}

const MAX_ORDERS_SHOWN = 3;

const OrderHistory: React.FC = () => {
  const router = useRouter();
  const { data: orders, isLoading, isError, error, refetch, isFetching } = useUserOrdersQuery();

  const orderList = orders ?? [];
  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, MAX_ORDERS_SHOWN);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-6 p-6">
        <AccountSectionHeader
          icon={ClipboardList}
          title="Istorija porudžbina"
          description="Pregled vaših prethodnih narudžbina"
        />

        {isLoading || (isFetching && orderList.length === 0) ? (
          <OrderHistorySkeleton />
        ) : isError ? (
          <div className="space-y-4 py-6 text-center">
            {isUnauthorizedError(error) ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Sesija je istekla. Prijavite se ponovo da vidite porudžbine.
                </p>
                <Button onClick={() => router.push('/auth/login')}>Prijava</Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Porudžbine trenutno nisu dostupne. Pokušajte ponovo.
                </p>
                <Button type="button" variant="outline" onClick={() => refetch()}>
                  Pokušaj ponovo
                </Button>
              </>
            )}
          </div>
        ) : orderList.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-7 w-7 text-primary" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Još nema porudžbina</p>
              <p className="text-sm text-muted-foreground">
                Kada napravite prvu narudžbinu, pojaviće se ovdje.
              </p>
            </div>
            <Button asChild>
              <Link href="/shop">Pogledajte ponudu</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Card key={String(order.id)} className="border-border/50 bg-muted/10 shadow-none">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-serif text-lg font-semibold text-primary">
                          Porudžbina #{getOrderDisplayNumber(order)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Datum: {formatOrderPurchaseDate(order.created_at)}
                        </p>
                        <p className="text-sm font-medium">
                          Ukupno: €{order.total_price.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                        {formatOrderStatus(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-sm font-medium text-muted-foreground">Artikli</p>
                    <ul className="space-y-2">
                      {order.items.map((item: OrderItem) => (
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
                                {item.size ? (
                                  <span className="ml-3">Veličina: {item.size}</span>
                                ) : null}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Boja:</span>
                                <span
                                  className="h-4 w-4 rounded-full border border-border"
                                  style={{ backgroundColor: item.color || '#FFFFFF' }}
                                />
                              </div>
                            </div>
                          </div>
                          <p className="shrink-0 text-sm font-semibold">€{item.price.toFixed(2)}</p>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/order/${order.id}`}
                      className="inline-block text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                    >
                      Pogledaj porudžbinu
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Ako želite da modifikujete ili izbrišete porudžbinu, pošaljite nam odgovor na email.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
