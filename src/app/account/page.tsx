'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserDetails from '@/components/Account/UserDetails';
import AddressManager from '@/components/Account/AddressManager';
import OrderHistory from '@/components/Account/Order/OrderHistory';
import Wishlist from '@/components/Account/Wishlist';
import Cart from '@/components/Account/Cart';
import Newsletter from '@/components/Frontpage/Newsletter';
import { useAuthStore } from '@/stores/useAuthStore';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return <AccountSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="m-5 mb-12 text-center text-3xl font-extrabold text-primary sm:mb-16 sm:text-4xl md:text-5xl lg:text-6xl">
        My Account
      </h1>

      <div className="mx-auto max-w-6xl space-y-8 sm:space-y-12">
        {/* User Details and Address */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <UserDetails />
          </div>
          <div>
            <AddressManager />
          </div>
        </div>

        {/* Order History */}
        <div>
          <OrderHistory />
        </div>

        {/* Wishlist and Cart */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Wishlist />
          </div>
          <div>
            <Cart />
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mt-16">
        <Newsletter />
      </div>
    </div>
  );
}
