'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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

function OrderPageContent({ params }: OrderPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = searchParams.get('token');
  const isGuestAccess = Boolean(accessToken?.trim());

  useEffect(() => {
    const unwrapParams = async () => {
      try {
        const resolvedParams = await params;
        if (!isAuthenticated && !isGuestAccess && !authLoading) {
          const nextPath = accessToken?.trim()
            ? `/order/${resolvedParams.orderId}?token=${encodeURIComponent(accessToken)}`
            : `/order/${resolvedParams.orderId}`;
          router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }
        setOrderId(resolvedParams.orderId);
      } catch (error) {
        console.error('Failed to resolve params:', error);
      } finally {
        setIsLoading(false);
      }
    };

    unwrapParams();
  }, [accessToken, authLoading, params, isAuthenticated, isGuestAccess, router]);

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
          href={isGuestAccess ? '/' : '/account'}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {isGuestAccess ? 'Povratak na početnu' : 'Nazad na nalog'}
        </Link>
        <OrderById orderId={orderId} accessToken={accessToken} />
      </div>
    </div>
  );
}

export default function OrderPage({ params }: OrderPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
          <OrderPageSkeleton />
        </div>
      }
    >
      <OrderPageContent params={params} />
    </Suspense>
  );
}
