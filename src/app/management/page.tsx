'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/api/axiosInstance';
import OrderManagement from '@/components/Management/OrderManagement';
import SalesManagement from '@/components/Management/SalesManagement';
import CatalogManagement from '@/components/Management/CatalogManagement';
import { User } from '@/app/types/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ManagementPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Example: read token from localStorage (or cookies via document.cookie)
    const token = localStorage.getItem('access_token');
    if (!token) {
      // No token => redirect to login
      router.replace('/auth/login');
      return;
    }

    // Call your API to verify the user's details
    axiosInstance
      .get<User>('/users/me')
      .then((res) => {
        const user = res.data;
        if (user?.role?.name !== 'ADMIN') {
          // return to previous page
          router.back();
          alert('You are not authorized to access this page.');
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        // On error, go to login
        router.replace('/auth/login');
      });
  }, [router]);

  // While we’re fetching the user data, show a loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render the management dashboard if the user is allowed
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#0097B2]">Management Dashboard</h1>
      </header>
      <main>
        <Tabs defaultValue="orders" className="mx-auto max-w-screen-xl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-6">
            <OrderManagement />
          </TabsContent>
          <TabsContent value="sales" className="mt-6">
            <SalesManagement />
          </TabsContent>
          <TabsContent value="catalog" className="mt-6">
            <CatalogManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
