'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const redirectToShop = setTimeout(() => {
      router.push('/shop');
    }, 3000);

    return () => clearTimeout(redirectToShop); 
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center">
      <FaCheckCircle className="text-[#0097B2] text-6xl mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Order Successful!</h1>
      <p className="text-lg text-gray-600">
        Thank you for your order! You will be redirected to the shop shortly.
      </p>
    </div>
  );
};

export default SuccessPage;
