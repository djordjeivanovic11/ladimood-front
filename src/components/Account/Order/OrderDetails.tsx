'use client';

import React from 'react';
import { useOrderByIdQuery } from '@/hooks/queries/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface OrderDetailsProps {
  orderId: string;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onClose }) => {
  const { data: order, isLoading, error } = useOrderByIdQuery(orderId);

  if (isLoading) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Failed to fetch order details.</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Order not found.</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Order #{order.plain_id || order.id}</CardTitle>
          <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Info */}
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-muted-foreground">Date:</span>{' '}
            {new Date(order.created_at).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium text-muted-foreground">Total:</span>{' '}
            <span className="text-lg font-semibold text-primary">
              €{order.total_price.toFixed(2)}
            </span>
          </p>
        </div>

        <Separator />

        {/* Order Items */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Items</h3>
          <ul className="space-y-4">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border bg-muted/50 p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {item.product.name} (x{item.quantity})
                    </span>
                    <span className="font-semibold">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>Color:</span>
                      <span
                        className="h-5 w-5 rounded-full border"
                        style={{ backgroundColor: item.color || '#FFFFFF' }}
                        title={`Color: ${item.color}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Size:</span>
                      <span className="font-medium">{item.size}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Close Button */}
        <div className="text-center">
          <Button onClick={onClose}>Close</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDetails;
