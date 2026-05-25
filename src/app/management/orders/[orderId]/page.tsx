'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchOrderDetailsById } from '@/api/management/axios';
import type { OrderResponse } from '@/app/types/types';
import { OrderLineImage } from '@/components/Order/OrderLineImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatOrderCode } from '@/lib/order-display';

export default function ManagementOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderIdParam = params.orderId;
  const numericOrderId = Number(orderIdParam);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(numericOrderId) || numericOrderId <= 0) {
      setError('Neispravan ID porudžbine.');
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        const response = await fetchOrderDetailsById(numericOrderId);
        setOrder(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Učitavanje porudžbine nije uspjelo.');
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [numericOrderId]);

  if (loading) {
    return <div className="p-8">Učitavanje...</div>;
  }

  if (!order || error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-destructive">{error ?? 'Porudžbina nije pronađena.'}</p>
            <Button variant="outline" onClick={() => router.push('/management')}>
              Nazad na menadžment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold">
            Porudžbina #{formatOrderCode(order.order_number ?? order.id)}
          </h1>
          <div className="flex gap-2">
            <Badge variant="outline">{order.status}</Badge>
            <Button variant="outline" onClick={() => router.push('/management')}>
              Nazad
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalji</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Kupac:{' '}
              <span className="text-foreground">
                {order.user ? `${order.user.full_name} (${order.user.email})` : 'Gost'}
              </span>
            </p>
            <p>
              Ukupno: <span className="text-foreground">€{order.total_price.toFixed(2)}</span>
            </p>
            {order.address ? (
              <p>
                Adresa:{' '}
                <span className="text-foreground">
                  {order.address.street_address}, {order.address.city}, {order.address.country}
                </span>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artikli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <OrderLineImage
                    src={item.product_image_url ?? item.product?.image_url}
                    alt={item.product_name}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x €{item.price.toFixed(2)} · {item.size ?? 'N/A'}
                    </p>
                  </div>
                </div>
                <span className="font-semibold">€{(item.quantity * item.price).toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
