// pages/order/page.tsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const OrderPage: React.FC = () => {
  return (
    <section className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-100 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 md:p-16 flex flex-col items-center max-w-md text-center">
        {/* Illustration/Icon */}
        <div className="w-40 h-40 mb-6 relative">
          <Image
            src="/images/empty-order.svg" // Ensure this image exists in your public/images directory
            alt="No Orders Yet"
            layout="fill"
            objectFit="contain"
          />
        </div>

        {/* Humorous Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Oops! No Orders Yet.
        </h1>
        <p className="text-gray-600 mb-6">
          It seems like your cart is feeling a bit lonely. Let’s fix that!
        </p>

        {/* Call-to-Action Button */}
        <Link href="/products" passHref>
          <a
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-purple-600 transition transform hover:scale-105 duration-300"
            aria-label="Shop Now"
          >
            Shop Now
          </a>
        </Link>
      </div>
    </section>
  );
};

export default OrderPage;
