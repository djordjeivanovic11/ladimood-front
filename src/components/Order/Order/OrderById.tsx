'use client';

import React from 'react';
import { OrderStatusEnum } from '@/app/types/types';
import { FaUser, FaTruck, FaBoxOpen } from 'react-icons/fa';
import OrderItem from './OrderItem';
import { useOrderByIdQuery } from '@/hooks/queries/useOrders';
import { getOrderDisplayNumber } from '@/lib/order-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderByIdProps {
  orderId: string;
}

const statusLabels: Record<string, string> = {
  CREATED: 'Kreirano',
  PENDING: 'Na čekanju',
  SHIPPED: 'Poslato',
  DELIVERED: 'Dostavljeno',
  CANCELLED: 'Otkazano',
};

function OrderSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-8 p-8 md:p-12">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
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
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-destructive">
            {error instanceof Error ? error.message : 'Učitavanje detalja porudžbine nije uspjelo.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Porudžbina nije pronađena.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case OrderStatusEnum.DELIVERED:
        return 'default';
      case OrderStatusEnum.SHIPPED:
        return 'secondary';
      case OrderStatusEnum.CANCELLED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardContent className="p-8 md:p-12">
        <div className="mb-10 flex flex-col items-center justify-between md:flex-row">
          <h1 className="text-3xl font-bold">Porudžbina #{getOrderDisplayNumber(order)}</h1>
          <Badge variant={getStatusVariant(order.status)} className="mt-4 px-4 py-2 md:mt-0">
            {statusLabels[order.status] ?? order.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FaUser className="mr-2 text-primary" /> Podaci o korisniku
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              {order.user_id ? <p>ID korisnika: {order.user_id}</p> : <p>Gost porudžbina</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FaTruck className="mr-2 text-green-500" /> Adresa za dostavu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-muted-foreground">
              <p>Detalji adrese dostupni su u potvrdi porudžbine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FaBoxOpen className="mr-2 text-yellow-500" /> Detalji porudžbine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>
                <strong>Kreirano:</strong> {new Date(order.created_at).toLocaleString('sr-ME')}
              </p>
              <p>
                <strong>Ukupno:</strong>{' '}
                <span className="font-semibold text-primary">€{order.total_price.toFixed(2)}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Artikli</h2>
          <div className="space-y-6">
            {order.items.map((item) => (
              <OrderItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderById;
