'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCart, createOrder } from '@/api/account/axios';
import { GuestCheckout } from '@/components/Checkout/GuestCheckout';
import { getPrimaryProductImageUrl } from '@/components/Management/catalog/catalog-image';
import { IMAGE_SIZES } from '@/lib/image';
import { Size } from '../types/types';
import AddressManager from '@/components/Account/AddressManager';
import { PhoneNumberEditor } from '@/components/Account/PhoneNumberEditor';
import { useAuthStore } from '@/stores/useAuthStore';
import { normalizePhoneNumber } from '@/lib/phone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import type { CartItem as CartItemType } from '@/app/types/types';

type CartItemData = CartItemType;

function ConfirmationSkeleton() {
  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <Skeleton className="mx-auto h-8 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ConfirmationPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.isLoading);
  const isVerifiedAccountCheckout = isAuthenticated && !!user?.email_verified;
  const hasPhoneNumber = normalizePhoneNumber(user?.phone_number).length >= 9;

  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isVerifiedAccountCheckout) {
      setIsLoading(false);
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await getCart();
        if (response?.items?.length > 0) {
          const items = response.items as CartItemData[];
          setCartItems(items);
          const newTotal = items.reduce(
            (sum: number, item: CartItemData) => sum + item.product.price * item.quantity,
            0
          );
          setTotalAmount(newTotal);
        } else {
          router.push('/shop');
        }
      } catch (err) {
        console.error('Failed to load cart items:', err);
        setError('Učitavanje korpe nije uspjelo. Pokušajte ponovo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [authLoading, router, isVerifiedAccountCheckout]);

  const handleFinalizeOrder = async () => {
    if (!hasPhoneNumber) {
      setError('Unesite broj telefona prije završetka porudžbine.');
      toast.error('Broj telefona je obavezan');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderItems = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size as Size,
        price: item.product.price,
      }));

      const orderData = {
        items: orderItems,
        payment_method: 'COD' as const,
      };

      const createdOrder = await createOrder(orderData);

      setCartItems([]);
      try {
        localStorage.setItem('lastOrder', JSON.stringify(createdOrder));
      } catch {
        // ignore storage errors
      }
      toast.success('Porudžbina je uspješno poslata!');
      router.push(`/success/${createdOrder.id}`);
    } catch (err) {
      console.error('Order creation failed:', err);
      setError('Slanje porudžbine nije uspjelo. Pokušajte ponovo kasnije.');
      toast.error('Porudžbina nije poslata');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (isVerifiedAccountCheckout && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <ConfirmationSkeleton />
      </div>
    );
  }

  if (!isVerifiedAccountCheckout) {
    return (
      <div className="min-h-screen bg-muted/50 p-4">
        <GuestCheckout onCancel={() => router.push('/shop')} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-primary">Potvrdite porudžbinu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Cart Items Overview */}
          <div>
            <h2 className="mb-4 text-lg font-medium">Artikli:</h2>
            {cartItems.length > 0 ? (
              <ul className="space-y-4">
                {cartItems.map((item, index) => {
                  const imageSrc = getPrimaryProductImageUrl(item.product);
                  return (
                    <li key={index} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={item.product.name || 'Slika proizvoda'}
                            className="rounded-md border object-cover"
                            width={64}
                            height={64}
                            sizes={IMAGE_SIZES.orderThumb}
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                            <span className="text-sm text-muted-foreground">Nema slike</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × €{item.product.price.toFixed(2)} | Veličina:{' '}
                            {item.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className="h-6 w-6 rounded-full border"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="font-medium">
                          €{(item.quantity * item.product.price).toFixed(2)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground">Korpa je prazna.</p>
            )}

            <div className="mt-6 flex justify-end">
              <p className="text-lg font-bold">Ukupno: €{totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Phone (only when missing) */}
          {!hasPhoneNumber ? (
            <div>
              <PhoneNumberEditor />
            </div>
          ) : null}

          <div>
            <AddressManager />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Nazad u korpu
            </Button>
            <Button
              onClick={handleFinalizeOrder}
              disabled={isSubmitting || cartItems.length === 0 || !hasPhoneNumber}
            >
              {isSubmitting ? 'Završavanje...' : 'Završi porudžbinu'}
            </Button>
          </div>

          {error && <div className="text-center text-destructive">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
