'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaCheckCircle } from 'react-icons/fa';
import { getOrderById } from '@/api/account/axios';
import { Order } from '@/app/types/types';

const SuccessPage: React.FC = () => {
  const { orderId } = useParams(); // Hashed ID from URL
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const fetchedOrder: Order = await getOrderById(orderId as string);
        console.log('Fetched Order:', fetchedOrder);
        setOrder(fetchedOrder); // Entire order object, including plain ID
      } catch (err: any) {
        setError('Failed to retrieve order details.');
        console.error('Error fetching order:', err.message || err);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      // If no order ID is provided, redirect to the home page
      router.push('/');
    }
  }, [orderId, router]);

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  // Simple loading state while fetching the order
  if (!order) {
    return <div className="text-center text-gray-600 mt-10">Loading your order...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="max-w-xl bg-white p-8 rounded-lg shadow-lg text-center">
        <FaCheckCircle className="text-[#0097B2] text-6xl mx-auto mb-6" />

        <h2 className="text-3xl font-bold text-black mb-2">
          Thank You for Your Order!
        </h2>

        <p className="text-gray-700 mb-6">
          We&apos;re excited to have you as our customer. Your order has been successfully placed!
        </p>

        <p className="text-gray-600 mb-8 leading-relaxed">
          We&apos;ve sent a confirmation email to your registered email address with the
          details of your purchase. You can also view your order history and more
          information in your account page.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/account')}
            className="px-5 py-2 bg-[#0097B2] text-white rounded-md shadow hover:bg-[#007A90] transition-colors"
          >
            Go to Account
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
