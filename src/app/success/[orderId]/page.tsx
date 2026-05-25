'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaCheckCircle } from 'react-icons/fa';
import ReferralPopup from '@/components/Order/Order/ReferralPopup';
import { OrderLineImage } from '@/components/Order/OrderLineImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderQuery } from '@/hooks/queries/useOrders';
import { useAuthStore } from '@/stores/useAuthStore';
import { mapOrderItemsToDisplay } from '@/lib/order-display';

type StoredOrder = {
  order_number?: number;
  id?: string;
  total_price: number;
  payment_method?: string;
  delivery_note?: string | null;
  address?: {
    street_address: string;
    city: string;
    state?: string | null;
    postal_code: string;
    country: string;
  } | null;
  items: Array<{
    product_id: number;
    product_name?: string;
    name?: string;
    quantity: number;
    price: number;
    size?: string | null;
    product_image_url?: string | null;
    image?: string;
  }>;
};

function SuccessSkeleton() {
  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="p-10">
        <Skeleton className="mx-auto mb-6 h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto mb-4 h-8 w-64" />
        <Skeleton className="mx-auto mb-8 h-4 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function readStoredOrder(key: string): StoredOrder | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredOrder;
  } catch {
    return null;
  }
}

export default function SuccessPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = typeof params.orderId === 'string' ? params.orderId : '';
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);

  const [storedOrder, setStoredOrder] = useState<StoredOrder | null>(null);
  const [legacyOrder, setLegacyOrder] = useState<StoredOrder | null>(null);
  const [guestOrder, setGuestOrder] = useState<StoredOrder | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const { data: fetchedOrder, isLoading: isFetchingOrder } = useOrderQuery(orderId);

  useEffect(() => {
    setStoredOrder(readStoredOrder('lastOrder'));
    setGuestOrder(readStoredOrder('lastGuestOrder'));
    setLegacyOrder(readStoredOrder('orderDetails'));
    setHydrated(true);
  }, []);

  const resolved = useMemo(() => {
    const apiOrder = fetchedOrder as StoredOrder | undefined;
    const source = apiOrder ?? storedOrder ?? guestOrder ?? legacyOrder;
    if (!source?.items?.length) return null;

    return {
      total: source.total_price ?? 0,
      address: source.address ?? null,
      delivery_note: source.delivery_note ?? null,
      items: mapOrderItemsToDisplay(source.items),
    };
  }, [fetchedOrder, storedOrder, guestOrder, legacyOrder]);

  const isLoading = !hydrated || (isAuthenticated && !authLoading && isFetchingOrder && !resolved);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-6">
        <SuccessSkeleton />
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="mt-10 text-center text-muted-foreground">Učitavanje vaše narudžbe...</div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-6">
      <Card className="w-full max-w-4xl">
        <CardContent className="flex flex-col gap-8 p-10 lg:flex-row">
          <div className="lg:w-1/2">
            <div className="text-center lg:text-left">
              <FaCheckCircle className="mx-auto mb-6 text-6xl text-primary lg:mx-0" />
              <h2 className="mb-4 text-3xl font-bold">Hvala Vam na Vašoj porudžbini!</h2>
              <p className="mb-6 text-muted-foreground">
                Srećni smo što ste odabrali Ladimood. Vaša porudžbina je uspješno zabilježena!
              </p>
              <div className="mb-6 rounded-lg border bg-background p-4 text-sm">
                <div className="font-medium">Plaćanje: pouzećem</div>
                <div className="text-muted-foreground">Gotovina kuriru prilikom dostave.</div>
                {resolved.address && (
                  <div className="mt-3 text-muted-foreground">
                    Dostava: {resolved.address.street_address}, {resolved.address.city}{' '}
                    {resolved.address.postal_code}, {resolved.address.country}
                  </div>
                )}
                {resolved.delivery_note && (
                  <div className="mt-2 text-muted-foreground">
                    Napomena: {resolved.delivery_note}
                  </div>
                )}
              </div>
              <p className="mb-8 leading-relaxed text-muted-foreground">
                Email sa detaljima porudžbine je poslat na vašu email adresu. U međuvremenu, ovdje
                je rezime vaše kupovine:
              </p>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-primary">Vaši Artikli:</h3>
              <ul className="space-y-4">
                {resolved.items.map((item, index) => (
                  <li
                    key={`${item.product_id}-${index}`}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <OrderLineImage src={item.image} alt={item.name} size="md" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × €{item.price.toFixed(2)} | Veličina: {item.size}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end">
                <p className="text-lg font-bold">Ukupno: €{resolved.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg lg:w-1/2">
            <ReferralPopup onClose={() => {}} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex gap-4">
        <Button onClick={() => router.push('/account')}>Idi na Profil</Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          Povratak na Početnu
        </Button>
      </div>
    </div>
  );
}
