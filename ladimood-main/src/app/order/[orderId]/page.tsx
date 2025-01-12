'use client';

import React, { useEffect, useState } from 'react';
import OrderById from '@/components/Order/Order/OrderById';
import Link from 'next/link';

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

const OrderPage: React.FC<OrderPageProps> = ({ params }) => {
  const [parsedOrderId, setParsedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      try {
        const resolvedParams = await params;
        const parsedId = parseInt(resolvedParams.orderId, 10);
        if (!isNaN(parsedId)) {
          setParsedOrderId(parsedId);
        } else {
          console.error('Invalid order ID format.');
        }
      } catch (error) {
        console.error('Failed to resolve params:', error);
      }
    };

    unwrapParams();
  }, [params]);

  if (parsedOrderId === null) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg">Loading order details or invalid order ID...</p>
      </div>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <OrderById orderId={parsedOrderId} />
      </div>
    </section>
  );
};

export default OrderPage;
