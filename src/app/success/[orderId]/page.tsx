'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  access_token?: string;
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

function normalizeOrderId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function matchesOrderId(candidateOrderId: unknown, routeOrderId: string): boolean {
  return normalizeOrderId(candidateOrderId) === normalizeOrderId(routeOrderId);
}

function SuccessSkeleton() {
  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="p-6 sm:p-8 lg:p-10">
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

function SuccessPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = typeof params.orderId === 'string' ? params.orderId : '';
  const urlAccessToken = searchParams.get('token');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);

  const [storedOrder, setStoredOrder] = useState<StoredOrder | null>(null);
  const [legacyOrder, setLegacyOrder] = useState<StoredOrder | null>(null);
  const [guestOrder, setGuestOrder] = useState<StoredOrder | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const fallbackAccessToken = useMemo(() => {
    const localCandidates = [storedOrder, guestOrder, legacyOrder];
    const matchingOrder = localCandidates.find(
      (candidate) =>
        matchesOrderId(candidate?.id, orderId) &&
        typeof candidate?.access_token === 'string' &&
        candidate.access_token.trim().length > 0
    );
    return matchingOrder?.access_token?.trim() ?? null;
  }, [orderId, storedOrder, guestOrder, legacyOrder]);

  const effectiveAccessToken = (urlAccessToken?.trim() || fallbackAccessToken)?.trim() ?? null;

  const { data: fetchedOrder, isLoading: isFetchingOrder } = useOrderQuery(
    orderId,
    effectiveAccessToken
  );

  useEffect(() => {
    setStoredOrder(readStoredOrder('lastOrder'));
    setGuestOrder(readStoredOrder('lastGuestOrder'));
    setLegacyOrder(readStoredOrder('orderDetails'));
    setHydrated(true);
  }, []);

  const resolved = useMemo(() => {
    const apiOrder = fetchedOrder as StoredOrder | undefined;
    const localSource = [storedOrder, guestOrder, legacyOrder].find(
      (candidate) => matchesOrderId(candidate?.id, orderId) && Boolean(candidate?.items?.length)
    );
    const source = apiOrder?.items?.length ? apiOrder : localSource;
    if (!source?.items?.length) return null;

    return {
      total: source.total_price ?? 0,
      address: source.address ?? null,
      delivery_note: source.delivery_note ?? null,
      items: mapOrderItemsToDisplay(source.items),
      access_token: source.access_token ?? null,
    };
  }, [fetchedOrder, orderId, storedOrder, guestOrder, legacyOrder]);

  const shouldFetchOrder = Boolean(orderId) && (Boolean(effectiveAccessToken) || isAuthenticated);
  const isLoading = !hydrated || (shouldFetchOrder && !authLoading && isFetchingOrder && !resolved);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4 sm:p-6">
        <SuccessSkeleton />
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4 sm:p-6">
        <Card className="w-full max-w-xl">
          <CardContent className="space-y-4 p-6 text-center sm:p-8">
            <h2 className="text-xl font-semibold">Ne možemo prikazati ovu porudžbinu</h2>
            <p className="text-sm text-muted-foreground">
              Provjerite email sa potvrdom porudžbine i otvorite sigurni link za pregled detalja.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => router.push('/')}>Povratak na Početnu</Button>
              <Button variant="outline" onClick={() => router.push('/shop')}>
                Nazad u Prodavnicu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4 sm:p-6">
      <Card className="w-full max-w-4xl">
        <CardContent className="flex flex-col gap-8 p-5 sm:p-8 lg:flex-row lg:p-10">
          <div className="lg:w-1/2">
            <div className="text-center lg:text-left">
              <FaCheckCircle className="mx-auto mb-6 text-6xl text-primary lg:mx-0" />
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
                Hvala Vam na Vašoj porudžbini!
              </h2>
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
                    className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <OrderLineImage src={item.image} alt={item.name} size="md" />
                      <div className="min-w-0">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground break-words">
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

      <div className="mt-8 flex w-full max-w-4xl flex-col gap-3 sm:flex-row">
        <Button
          className="min-h-11 w-full sm:w-auto"
          onClick={() =>
            router.push(
              resolved.access_token
                ? `/order/${orderId}?token=${encodeURIComponent(resolved.access_token)}`
                : `/order/${orderId}`
            )
          }
        >
          Pregled porudžbine
        </Button>
        <Button
          variant="outline"
          className="min-h-11 w-full sm:w-auto"
          onClick={() => router.push(isAuthenticated ? '/account' : '/auth/login?next=/account')}
        >
          {isAuthenticated ? 'Idi na Profil' : 'Prijava'}
        </Button>
        <Button
          variant="secondary"
          className="min-h-11 w-full sm:w-auto"
          onClick={() => router.push('/')}
        >
          Povratak na Početnu
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4 sm:p-6">
          <SuccessSkeleton />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
