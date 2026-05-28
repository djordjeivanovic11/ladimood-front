'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { fetchOrderDetailsById } from '@/api/management/axios';
import type { OrderResponse } from '@/app/types/types';
import { AccountSectionHeader } from '@/components/Account/AccountSectionHeader';
import {
  OrderInfoPanel,
  OrderItemsList,
  OrderSummaryPanel,
} from '@/components/Order/OrderDetailSections';
import { formatOrderAddress, formatOrderCode } from '@/lib/order-display';
import { formatPhoneNumber } from '@/lib/phone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function ManagementOrderSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Skeleton className="h-4 w-32" />
      <Card className="border-border/60 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

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
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <ManagementOrderSkeleton />
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-destructive">{error ?? 'Porudžbina nije pronađena.'}</p>
              <Button variant="outline" onClick={() => router.push('/management')}>
                Nazad na menadžment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const buyerName = order.user?.full_name ?? 'Gost';
  const buyerEmail = order.user?.email;
  const buyerPhone = order.user?.phone_number
    ? formatPhoneNumber(order.user.phone_number)
    : 'Nema telefona';

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/management"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Nazad na menadžment
        </Link>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-6 p-6">
            <AccountSectionHeader
              icon={ClipboardList}
              title="Detalji porudžbine"
              description="Pregled kupca, adrese i stavki porudžbine"
            />

            <OrderSummaryPanel
              orderNumber={formatOrderCode(order.order_number ?? order.id)}
              createdAt={order.created_at}
              totalPrice={order.total_price}
              status={order.status}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <OrderInfoPanel label="Adresa za dostavu">
                {formatOrderAddress(order.address)}
              </OrderInfoPanel>
              <OrderInfoPanel label="Kupac">
                <p>{buyerName}</p>
                {buyerEmail ? <p className="mt-1 text-muted-foreground">{buyerEmail}</p> : null}
                <p className="mt-3">
                  <span className="font-medium text-muted-foreground">Telefon:</span> {buyerPhone}
                </p>
              </OrderInfoPanel>
            </div>

            <OrderItemsList items={order.items} />

            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push('/management')}
            >
              Nazad na menadžment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
