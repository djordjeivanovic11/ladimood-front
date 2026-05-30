'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { getWishlist, removeFromWishlist } from '@/api/account/axios';
import { WishlistItem } from '@/app/types/types';
import { AccountSectionHeader } from '@/components/Account/AccountSectionHeader';
import { OrderLineImage } from '@/components/Order/OrderLineImage';
import { getPrimaryProductImageUrl } from '@/components/Management/catalog/catalog-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Wishlist: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    getWishlist().then(setWishlist).catch(console.error);
  }, []);

  const handleRemove = async (itemId: number) => {
    try {
      await removeFromWishlist(itemId);
      setWishlist((items) => items.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item from wishlist', error);
    }
  };

  return (
    <Card className="h-full border-border/60 shadow-sm">
      <CardContent className="space-y-5 p-6">
        <AccountSectionHeader icon={Heart} title="Lista želja" description="Sačuvani artikli" />

        {wishlist.length > 0 ? (
          <ul className="space-y-4">
            {wishlist.map((item) => (
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
                    Cijena: €{item.product.price.toFixed(2)} · Veličina: {item.size}
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
                  <Button asChild size="sm" className="gap-2">
                    <Link href="/shop">
                      <ShoppingBag className="h-4 w-4" aria-hidden />U šop
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    onClick={() => handleRemove(item.id)}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    Ukloni
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">Lista želja je prazna.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Wishlist;
