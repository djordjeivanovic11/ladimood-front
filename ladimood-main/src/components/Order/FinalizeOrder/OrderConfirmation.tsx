import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const OrderConfirmation: React.FC = () => {
  const router = useRouter();
  const [errorMessage] = useState<string | null>(null);

  return (
    <div className="p-8 bg-white shadow-lg rounded-lg text-center transform transition-transform duration-300 scale-100 w-96">
        <FaCheckCircle className="text-[#0097B2] text-6xl mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Order!</h2>
        <p className="text-lg text-gray-700 mb-4">
          Your order has been placed successfully. Please check your email for more details and a confirmation of your purchase.
        </p>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <div className="mt-6">
          <button onClick={() => router.push('/shop')}
          className="w-full bg-[#0097B2] text-white py-2 rounded-lg shadow hover:bg-[#007A90] transition duration-300">
            Continue Shopping
          </button>
        </div>
      </div>
  );
};

export default OrderConfirmation;
