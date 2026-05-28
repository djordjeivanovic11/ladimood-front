'use client';

import React from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { useOrderByIdQuery } from '@/hooks/queries/useOrders';
import { AccountSectionHeader } from '@/components/Account/AccountSectionHeader';
import {
  OrderInfoPanel,
  OrderItemsList,
  OrderSummaryPanel,
} from '@/components/Order/OrderDetailSections';
import { getOrderDisplayNumber, formatOrderAddress } from '@/lib/order-display';
import { formatPaymentMethod } from '@/lib/order-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderByIdProps {
  orderId: string;
}

function OrderSkeleton() {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  );
}

const OrderById: React.FC<OrderByIdProps> = ({ orderId }) => {
  const { data: order, isLoading, error } = useOrderByIdQuery(orderId);

  if (isLoading) {
    return <OrderSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="space-y-4 py-10 text-center">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : 'Učitavanje detalja porudžbine nije uspjelo.'}
          </p>
          <Button asChild variant="outline">
            <Link href="/account">Nazad na nalog</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="space-y-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">Porudžbina nije pronađena.</p>
          <Button asChild variant="outline">
            <Link href="/account">Nazad na nalog</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-6 p-6">
        <AccountSectionHeader
          icon={ClipboardList}
          title="Detalji porudžbine"
          description="Pregled stavki, adrese i statusa porudžbine"
        />

        <OrderSummaryPanel
          orderNumber={getOrderDisplayNumber(order)}
          createdAt={order.created_at}
          totalPrice={order.total_price}
          status={order.status}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <OrderInfoPanel label="Adresa za dostavu">
            {formatOrderAddress(order.address)}
          </OrderInfoPanel>
          <OrderInfoPanel label="Plaćanje">
            <p>{formatPaymentMethod(order.payment_method)}</p>
            {order.delivery_note ? (
              <p className="mt-3 text-muted-foreground">
                <span className="font-medium text-foreground">Napomena:</span> {order.delivery_note}
              </p>
            ) : null}
          </OrderInfoPanel>
        </div>

        <OrderItemsList items={order.items} />

        <p className="text-xs leading-relaxed text-muted-foreground">
          Ako želite da modifikujete ili izbrišete porudžbinu, pošaljite nam odgovor na email.
        </p>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/account">Nazad na nalog</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderById;
