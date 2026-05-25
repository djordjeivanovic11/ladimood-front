'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { CallToOrderProps } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CallToOrder: React.FC<CallToOrderProps> = ({ cartItems, onCancel, onOrder }) => {
  const router = useRouter();

  if (!cartItems || cartItems.length === 0) {
    return <div className="text-center text-muted-foreground">Korpa je prazna.</div>;
  }

  const totalAmount = cartItems.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + price * item.quantity;
  }, 0);

  const handleProceedToConfirmation = () => {
    const orderData = {
      items: cartItems.map((item) => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image_url,
          description: item.product.description,
          created_at: item.product.created_at,
          updated_at: item.product.updated_at,
          category: item.product.category,
        },
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      })),
      total: totalAmount,
    };
    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    if (onOrder) {
      onOrder();
    }
    router.push('/confirmation');
  };

  return (
    <Card className="mt-2 border-border/70 bg-card/60">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold leading-tight">Spremni za porudžbinu?</h2>
            <p className="mt-1 text-muted-foreground">
              Imate <span className="font-semibold text-foreground">{cartItems.length}</span>{' '}
              {cartItems.length === 1 ? 'artikal' : 'artikala'} u korpi.
            </p>
          </div>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <ShoppingBag className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
          <p className="text-sm text-muted-foreground">Ukupno za naplatu</p>
          <p className="text-3xl font-bold leading-none text-primary">€{totalAmount.toFixed(2)}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Button className="w-full sm:w-auto" onClick={handleProceedToConfirmation}>
            Nastavi na potvrdu
          </Button>
          <Button className="w-full sm:w-auto" variant="outline" onClick={onCancel}>
            Otkaži
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallToOrder;
