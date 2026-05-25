'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Store, X } from 'lucide-react';
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
          <ul className="space-y-4">
            {cart.items.map((item: CartItemType) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center"
              >
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    width={96}
                    height={96}
                    className="mx-auto h-24 w-24 shrink-0 rounded-md border border-border/50 object-cover sm:mx-0"
                  />
                ) : null}
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="font-medium text-foreground">{item.product.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    €{item.product.price.toFixed(2)} · Kol: {item.quantity} · Veličina: {item.size}
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
                <div className="flex flex-col gap-2 sm:shrink-0">
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href="/shop">
                      <Store className="h-4 w-4" aria-hidden />
                      Nastavi kupovinu
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    onClick={() => handleRemove(item.id, item.color, item.size)}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    Ukloni
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">Korpa je prazna.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Cart;
