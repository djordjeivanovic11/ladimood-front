'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderById from '@/components/Order/Order/OrderById';
import { useAuthStore } from '@/stores/useAuthStore';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

function OrderSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default function OrderPage({ params }: OrderPageProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const unwrapParams = async () => {
      try {
        const resolvedParams = await params;
        setOrderId(resolvedParams.orderId);
      } catch (error) {
        console.error('Failed to resolve params:', error);
      } finally {
        setIsLoading(false);
      }
    };

    unwrapParams();
  }, [authLoading, params, isAuthenticated, router]);

  if (isLoading || authLoading || !orderId) {
    return <OrderSkeleton />;
  }

  return (
    <section className="min-h-screen bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <OrderById orderId={orderId} />
      </div>
    </section>
  );
}
