'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCart, createOrder } from '@/api/account/axios';
import { Size } from '../types/types';
import AddressManager from '@/components/Account/AddressManager';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface CartItemData {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
  quantity: number;
  color: string;
  size: Size;
}

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

  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
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
        setError('Failed to load cart items. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [router, isAuthenticated]);

  const handleFinalizeOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const orderItems = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: item.product.price,
      }));

      const orderData = {
        items: orderItems,
        payment_method: 'COD' as const,
      };

      const createdOrder = await createOrder(orderData);

      setCartItems([]);
      localStorage.setItem(
        'orderDetails',
        JSON.stringify({ ...orderData, total_price: totalAmount })
      );
      toast.success('Order placed successfully!');
      router.push(`/success/${createdOrder.id}`);
    } catch (err) {
      console.error('Order creation failed:', err);
      setError('Failed to place the order. Please try again later.');
      toast.error('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <ConfirmationSkeleton />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-primary">Confirm Your Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Cart Items Overview */}
          <div>
            <h2 className="mb-4 text-lg font-medium">Items:</h2>
            {cartItems.length > 0 ? (
              <ul className="space-y-4">
                {cartItems.map((item, index) => (
                  <li key={index} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name || 'Product image'}
                          className="rounded-md border object-cover"
                          width={64}
                          height={64}
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                          <span className="text-sm text-muted-foreground">No Image</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × €{item.product.price.toFixed(2)} | Size: {item.size}
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
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Your cart is empty.</p>
            )}

            <div className="mt-6 flex justify-end">
              <p className="text-lg font-bold">Total: €{totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <AddressManager />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Back to Cart
            </Button>
            <Button onClick={handleFinalizeOrder} disabled={isSubmitting || cartItems.length === 0}>
              {isSubmitting ? 'Finalizing...' : 'Finalize Order'}
            </Button>
          </div>

          {error && <div className="text-center text-destructive">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
