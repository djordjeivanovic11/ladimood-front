'use client';

import React, { useState } from 'react';
import { useUserOrdersQuery } from '@/hooks/queries/useOrders';
import { OrderItem } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function OrderHistorySkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const OrderHistory: React.FC = () => {
  const { data: orders = [], isLoading, error } = useUserOrdersQuery();
  const [visibleCount, setVisibleCount] = useState(3);

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const visibleOrders = sortedOrders.slice(0, visibleCount);
  const hasMore = visibleCount < orders.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  if (isLoading) {
    return (
      <div className="mx-auto my-10 max-w-3xl px-4">
        <h2 className="mb-6 text-center text-3xl font-bold">Order History</h2>
        <OrderHistorySkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto my-10 max-w-3xl px-4 text-center">
        <p className="text-destructive">Failed to fetch order history.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto my-10 max-w-3xl px-4">
      <h2 className="mb-6 text-center text-3xl font-bold">Order History</h2>

      {visibleOrders.length > 0 ? (
        <div className="space-y-6">
          {visibleOrders.map((order) => (
            <Card key={order.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-primary">
                      Order #{order.plain_id || order.id}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Placed on: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium">Total: €{order.total_price.toFixed(2)}</p>
                  </div>
                  <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="mb-3 text-base font-medium">Items</h3>
                <ul className="space-y-3">
                  {order.items.map((item: OrderItem) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                          <span className="ml-4">Size: {item.size}</span>
                        </p>
                        <div className="mt-1 flex items-center text-sm text-muted-foreground">
                          <span>Color:</span>
                          <span
                            className="ml-2 h-4 w-4 rounded-full border"
                            style={{ backgroundColor: item.color || '#FFFFFF' }}
                          />
                        </div>
                      </div>
                      <p className="text-sm font-semibold">€{item.price.toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-primary">
              You have no orders yet. Start shopping and make your first purchase!
            </p>
          </CardContent>
        </Card>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button onClick={handleLoadMore}>Load More</Button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
