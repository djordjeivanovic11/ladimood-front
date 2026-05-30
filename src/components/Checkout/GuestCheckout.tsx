'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { guestCheckoutSchema, type GuestCheckoutFormData } from '@/schemas/checkout.schema';
import { useCreateGuestOrder } from '@/hooks/queries/useOrders';
import { useCartStore } from '@/stores/useCartStore';
import { getPrimaryProductImageUrl } from '@/components/Management/catalog/catalog-image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMAGE_SIZES } from '@/lib/image';
import { normalizePhoneNumber } from '@/lib/phone';
import { generateIdempotencyKey } from '@/lib/idempotency';
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
    setValue,
    formState: { errors },
  } = useForm<GuestCheckoutFormData>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      guest_email: '',
      guest_name: '',
      guest_phone: '',
      delivery_note: '',
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
        orderData: {
          items: cartItems.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            color: item.color,
            size: item.size as Size,
            price: item.product.price,
          })),
          guest_email: data.guest_email,
          guest_name: data.guest_name,
          guest_phone: normalizePhoneNumber(data.guest_phone),
          delivery_note: data.delivery_note,
          address: data.address,
        },
        idempotencyKey: generateIdempotencyKey('guest-order'),
      },
      {
        onSuccess: (order) => {
          // Store the latest guest order for the success page (since fetching orders requires auth)
          localStorage.setItem('lastGuestOrder', JSON.stringify(order));
          const successPath =
            order.access_token?.trim()
              ? `/success/${order.id}?token=${encodeURIComponent(order.access_token)}`
              : `/success/${order.id}`;
          if (onSuccess) {
            onSuccess(String(order.id));
          } else {
            router.push(successPath);
          }
        },
      }
    );
  };

  const totalPrice = getTotalPrice();
  const normalizeHex = (value: string) => value.trim().toLowerCase();
  const colorNameFromHex: Record<string, string> = {
    '#ffffff': 'Bijela',
    '#fff': 'Bijela',
    '#000000': 'Crna',
    '#000': 'Crna',
    '#ff0000': 'Crvena',
    '#00ff00': 'Zelena',
    '#0000ff': 'Plava',
    '#ffff00': 'Žuta',
    '#ffa500': 'Narandžasta',
    '#800080': 'Ljubičasta',
    '#808080': 'Siva',
    '#a52a2a': 'Braon',
    '#ffc0cb': 'Roze',
    '#f5f5dc': 'Bež',
  };

  const getColorLabel = (colorHex: string, itemProduct: (typeof cartItems)[number]['product']) => {
    const normalized = normalizeHex(colorHex);
    const variantMatch = itemProduct.variants?.find(
      (variant) => normalizeHex(variant.color_hex) === normalized
    );

    if (variantMatch?.color_name && !variantMatch.color_name.trim().startsWith('#')) {
      return variantMatch.color_name;
    }

    if (normalized in colorNameFromHex) {
      return colorNameFromHex[normalized];
    }

    return 'Odabrana boja';
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Brza porudžbina</CardTitle>
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Korpa je prazna</p>
            <Button className="mt-4" onClick={() => router.push('/shop')}>
              Nastavi kupovinu
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              Plaćanje je <span className="font-medium text-foreground">pouzećem</span> (gotovina
              kuriru).
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Kontakt podaci</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guest_email">E-mail *</Label>
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
                  <Label htmlFor="guest_name">Ime i prezime *</Label>
                  <Input id="guest_name" placeholder="Marko Marković" {...register('guest_name')} />
                  {errors.guest_name && (
                    <p className="text-sm text-destructive">{errors.guest_name.message}</p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="guest_phone">Telefon *</Label>
                  <PhoneNumberInput
                    inputProps={{ id: 'guest_phone', name: 'guest_phone' }}
                    onChange={(phone) => setValue('guest_phone', phone, { shouldValidate: true })}
                    hasError={!!errors.guest_phone}
                  />
                  {errors.guest_phone && (
                    <p className="text-sm text-destructive">{errors.guest_phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Adresa za dostavu</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="street_address">Ulica i broj *</Label>
                  <Input
                    id="street_address"
                    placeholder="npr. Ulica X"
                    {...register('address.street_address')}
                  />
                  {errors.address?.street_address && (
                    <p className="text-sm text-destructive">
                      {errors.address.street_address.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Grad *</Label>
                  <Input id="city" placeholder="Podgorica" {...register('address.city')} />
                  {errors.address?.city && (
                    <p className="text-sm text-destructive">{errors.address.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Opština</Label>
                  <Input id="state" placeholder="Opciono" {...register('address.state')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Poštanski broj *</Label>
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
                  <Label htmlFor="country">Država *</Label>
                  <Input id="country" placeholder="Crna Gora" {...register('address.country')} />
                  {errors.address?.country && (
                    <p className="text-sm text-destructive">{errors.address.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery note */}
            <div className="space-y-2">
              <Label htmlFor="delivery_note">Napomena za dostavu (opciono)</Label>
              <textarea
                id="delivery_note"
                rows={3}
                className={cn(
                  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                )}
                placeholder="Ulaz, sprat, interfon, vrijeme dostave..."
                {...register('delivery_note')}
              />
              {errors.delivery_note && (
                <p className="text-sm text-destructive">{errors.delivery_note.message}</p>
              )}
            </div>

            {/* Order Summary */}
            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-3 text-lg font-semibold">Pregled porudžbine</h3>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {getPrimaryProductImageUrl(item.product) ? (
                        <Image
                          src={getPrimaryProductImageUrl(item.product) as string}
                          alt={item.product.name}
                          width={44}
                          height={44}
                          sizes={IMAGE_SIZES.orderThumb}
                          className="h-11 w-11 rounded-md border object-cover"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate text-foreground">{item.product.name}</p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>
                            {getColorLabel(item.color, item.product)}, {item.size} x{item.quantity}
                          </span>
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-border"
                            style={{ backgroundColor: item.color }}
                            title={item.color}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="font-medium">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="mt-3 flex justify-between border-t pt-3">
                  <span className="text-lg font-bold">Ukupno</span>
                  <span className="text-lg font-bold text-primary">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Otkaži
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending}
                className={cn('flex-1', !onCancel && 'w-full')}
              >
                {isPending ? 'Obrada...' : 'Završi porudžbinu'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
