'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
    <Card className="mt-4">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-xl font-semibold">Spremni za porudžbinu?</h2>
          <p className="text-muted-foreground">Imate {cartItems.length} artikala u korpi.</p>
          <p className="font-bold text-primary">Ukupno: €{totalAmount.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleProceedToConfirmation}>Nastavi na potvrdu</Button>
          <Button variant="outline" onClick={onCancel}>
            Otkaži
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallToOrder;
