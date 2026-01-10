'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle } from 'react-icons/fa';
import Image from 'next/image';
import ReferralPopup from '@/components/Order/Order/ReferralPopup';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  size: string;
  image?: string;
}

interface OrderData {
  items: OrderItem[];
  total_price: number;
}

function SuccessSkeleton() {
  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="p-10">
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

export default function SuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedOrderData = localStorage.getItem('orderDetails');
    if (storedOrderData) {
      setOrder(JSON.parse(storedOrderData));
    } else {
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-6">
        <SuccessSkeleton />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mt-10 text-center text-muted-foreground">Učitavanje vaše narudžbe...</div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-6">
      <Card className="w-full max-w-4xl">
        <CardContent className="flex flex-col gap-8 p-10 lg:flex-row">
          {/* Thank You Section */}
          <div className="lg:w-1/2">
            <div className="text-center lg:text-left">
              <FaCheckCircle className="mx-auto mb-6 text-6xl text-primary lg:mx-0" />
              <h2 className="mb-4 text-3xl font-bold">Hvala Vam na Vašoj porudžbini!</h2>
              <p className="mb-6 text-muted-foreground">
                Srećni smo što ste odabrali Ladimood. Vaša porudžbina je uspješno zabilježena!
              </p>
              <p className="mb-8 leading-relaxed text-muted-foreground">
                Email sa detaljima porudžbine je poslat na vašu email adresu. U međuvremenu, ovdje
                je rezime vaše kupovine:
              </p>
            </div>

            {/* Order Summary */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-primary">Vaši Artikli:</h3>
              <ul className="space-y-4">
                {order.items.map((item, index) => (
                  <li
                    key={`${item.product_id}-${index}`}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={item.image || '/images/default-product.jpg'}
                        alt={item.name || 'Proizvod'}
                        className="rounded-md border object-cover"
                        width={64}
                        height={64}
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × €{item.price.toFixed(2)} | Size: {item.size}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end">
                <p className="text-lg font-bold">Total: €{order.total_price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Referral Section */}
          <div className="rounded-lg lg:w-1/2">
            <ReferralPopup onClose={() => {}} />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <Button onClick={() => router.push('/account')}>Idi na Profil</Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          Povratak na Početnu
        </Button>
      </div>
    </div>
  );
}
