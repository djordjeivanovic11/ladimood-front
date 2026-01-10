'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { guestCheckoutSchema, type GuestCheckoutFormData } from '@/schemas/checkout.schema';
import { useCreateGuestOrder } from '@/hooks/queries/useOrders';
import { useCartStore } from '@/stores/useCartStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Size } from '@/app/types/types';

interface GuestCheckoutProps {
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
}

export function GuestCheckout({ onSuccess, onCancel }: GuestCheckoutProps) {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const { mutate: createOrder, isPending } = useCreateGuestOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestCheckoutFormData>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      guest_email: '',
      guest_name: '',
      guest_phone: '',
      address: {
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
      },
    },
  });

  const onSubmit = (data: GuestCheckoutFormData) => {
    if (cartItems.length === 0) {
      return;
    }

    createOrder(
      {
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          color: item.color,
          size: item.size as Size,
          price: item.product.price,
        })),
        guest_email: data.guest_email,
        guest_name: data.guest_name,
        guest_phone: data.guest_phone,
        address: data.address,
      },
      {
        onSuccess: (order) => {
          if (onSuccess) {
            onSuccess(String(order.id));
          } else {
            router.push(`/success/${order.id}`);
          }
        },
      }
    );
  };

  const totalPrice = getTotalPrice();

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Guest Checkout</CardTitle>
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button className="mt-4" onClick={() => router.push('/shop')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Contact Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guest_email">Email *</Label>
                  <Input
                    id="guest_email"
                    type="email"
                    placeholder="your@email.com"
                    {...register('guest_email')}
                  />
                  {errors.guest_email && (
                    <p className="text-sm text-destructive">{errors.guest_email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest_name">Full Name *</Label>
                  <Input id="guest_name" placeholder="John Doe" {...register('guest_name')} />
                  {errors.guest_name && (
                    <p className="text-sm text-destructive">{errors.guest_name.message}</p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="guest_phone">Phone (optional)</Label>
                  <Input
                    id="guest_phone"
                    type="tel"
                    placeholder="+382 67 123 456"
                    {...register('guest_phone')}
                  />
                  {errors.guest_phone && (
                    <p className="text-sm text-destructive">{errors.guest_phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Shipping Address</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="street_address">Street Address *</Label>
                  <Input
                    id="street_address"
                    placeholder="123 Main St"
                    {...register('address.street_address')}
                  />
                  {errors.address?.street_address && (
                    <p className="text-sm text-destructive">
                      {errors.address.street_address.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="Podgorica" {...register('address.city')} />
                  {errors.address?.city && (
                    <p className="text-sm text-destructive">{errors.address.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Region</Label>
                  <Input id="state" placeholder="Optional" {...register('address.state')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    placeholder="81000"
                    {...register('address.postal_code')}
                  />
                  {errors.address?.postal_code && (
                    <p className="text-sm text-destructive">{errors.address.postal_code.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" placeholder="Montenegro" {...register('address.country')} />
                  {errors.address?.country && (
                    <p className="text-sm text-destructive">{errors.address.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-3 text-lg font-semibold">Order Summary</h3>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.product.name} ({item.color}, {item.size}) x{item.quantity}
                    </span>
                    <span className="font-medium">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="mt-3 flex justify-between border-t pt-3">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-primary">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending}
                className={cn('flex-1', !onCancel && 'w-full')}
              >
                {isPending ? 'Processing...' : 'Complete Order'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
