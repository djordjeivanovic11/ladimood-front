'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import OrderById from '@/components/Order/Order/OrderById';
import { useAuthStore } from '@/stores/useAuthStore';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

function OrderPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-96 w-full rounded-lg" />
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
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <OrderPageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Nazad na nalog
        </Link>
        <OrderById orderId={orderId} />
      </div>
    </div>
  );
}
