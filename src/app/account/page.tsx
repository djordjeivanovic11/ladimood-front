'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserDetails from '@/components/Account/UserDetails';
import AddressManager from '@/components/Account/AddressManager';
import OrderHistory from '@/components/Account/Order/OrderHistory';
import Wishlist from '@/components/Account/Wishlist';
import Cart from '@/components/Account/Cart';
import Newsletter from '@/components/Frontpage/Newsletter';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCurrentUser } from '@/hooks/queries/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

function AccountSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <Skeleton className="mx-auto h-12 w-64" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);
  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (authLoading || userLoading) return;
    if (!isAuthenticated && !user) {
      router.replace('/auth/login');
    }
  }, [authLoading, userLoading, isAuthenticated, user, router]);

  if (authLoading || userLoading) {
    return <AccountSkeleton />;
  }

  if (!isAuthenticated && !user) {
    return null;
  }

  const isVerified = !!user?.email_verified;

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="m-5 mb-10 text-center font-serif text-3xl font-semibold tracking-tight text-primary sm:mb-12 sm:text-4xl md:text-5xl">
        Moj nalog
      </h1>

      <div className="mx-auto max-w-6xl space-y-8 sm:space-y-12">
        {!isVerified ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-amber-900">
            <h2 className="text-xl font-semibold">Potvrdite e-mail za pristup nalogu</h2>
            <p className="mt-2">
              Porudžbine i dalje možete završiti bez prepreka, ali detalji naloga, adrese i istorija
              porudžbina su dostupni tek nakon verifikacije e-mail adrese.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/confirmation">Nastavi na porudžbinu</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/verified?next=/account">Provjeri verifikaciju</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
              <UserDetails />
              <AddressManager />
            </div>

            <OrderHistory />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
              <Wishlist />
              <Cart />
            </div>
          </>
        )}
      </div>

      <div className="mt-10 sm:mt-16">
        <Newsletter />
      </div>
    </div>
  );
}
