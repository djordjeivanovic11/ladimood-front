"use client";

import React, { useEffect, useState } from 'react';
import {useRouter } from 'next/navigation';
import OrderSummary from '@/components/Order/Order/OrderSummary';
import AddressManager from '@/components/Account/AddressManager';
import { getCurrentUser } from '@/api/account/axios';

const OrderPage: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      // No access token, redirect to login
      router.push('/auth/login');
      return;
    }

    // Check if the access token is valid by fetching user info
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsLoggedIn(true); // User is logged in
        } else {
          setIsLoggedIn(false);
          router.push('/auth/login'); // Redirect to login if no user is found
        }
      } catch (error) {
        setIsLoggedIn(false);
        router.push('/auth/login'); // Redirect to login if there's an error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Display loading indicator while checking login status
  }

  if (!isLoggedIn) {
    return null; // Don't render anything if not logged in (since user will be redirected)
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-200 min-h-screen flex items-center justify-center py-12">
      <div className="container max-w-5xl mx-auto px-4 lg:px-8 space-y-12">
        <div className="flex flex-col lg:flex-row justify-center lg:space-x-16 space-y-12 lg:space-y-0">
          {/* Address Section - Wider */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-4xl font-extrabold text-gray-800 text-center lg:text-left">Your Order Details</h1>
            <div className="p-8 bg-white shadow-md rounded-xl mt-6">
              <AddressManager onAddressSaved={() => {}} />
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="w-full lg:w-1/2">
            <div className="p-8 bg-white shadow-md rounded-xl">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
