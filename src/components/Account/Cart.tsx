'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, X } from 'lucide-react';
import CallToOrder from '@/components/Order/Cart/CallToOrder';
import { OrderLineImage } from '@/components/Order/OrderLineImage';
import { getPrimaryProductImageUrl } from '@/components/Management/catalog/catalog-image';
import { getCart, removeFromCart } from '@/api/account/axios';
import { Cart as CartType, CartItem as CartItemType, Size } from '@/app/types/types';
import { AccountSectionHeader } from '@/components/Account/AccountSectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartType | null>(null);

  useEffect(() => {
    getCart().then(setCart).catch(console.error);
  }, []);

  const handleRemove = async (itemId: number, color: string, size: string) => {
    try {
      await removeFromCart(itemId, color, size as Size);
      const updatedCart = await getCart();
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to remove item from cart', error);
    }
  };

  return (
    <Card className="h-full border-border/60 shadow-sm">
      <CardContent className="space-y-5 p-6">
        <AccountSectionHeader
          icon={ShoppingCart}
          title="Korpa"
          description="Artikli spremni za kupovinu"
        />

        {cart && cart.items.length > 0 ? (
          <>
            <ul className="space-y-4">
              {cart.items.map((item: CartItemType) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center"
                >
                  <OrderLineImage
                    src={getPrimaryProductImageUrl(item.product)}
                    alt={item.product.name}
                    className="mx-auto sm:mx-0"
                  />
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p className="font-medium text-foreground">{item.product.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      €{item.product.price.toFixed(2)} · Kol: {item.quantity} · Veličina:{' '}
                      {item.size}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                      <span className="text-xs text-muted-foreground">Boja:</span>
                      <span
                        className="h-4 w-4 rounded-full border border-border"
                        style={{ backgroundColor: item.color }}
                        title={item.color}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-muted-foreground sm:shrink-0"
                    onClick={() => handleRemove(item.id, item.color, item.size)}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    Ukloni
                  </Button>
                </li>
              ))}
            </ul>

            <CallToOrder cartItems={cart.items} onCancel={() => undefined} />

            <Button asChild variant="outline" className="w-full">
              <Link href="/shop">Nastavi kupovinu</Link>
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">Korpa je prazna.</p>
            <Button asChild>
              <Link href="/shop">Nastavi kupovinu</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Cart;
