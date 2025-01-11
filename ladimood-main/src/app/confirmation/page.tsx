'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder} from '@/api/account/axios';
import { OrderStatusEnum } from '../types/types';
import Image from 'next/image';
import AddressManager from '@/components/Account/AddressManager';

const ConfirmationPage: React.FC = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Load cart data from sessionStorage
  useEffect(() => {
    const storedOrderData = sessionStorage.getItem('orderData');
    if (storedOrderData) {
      const parsedData = JSON.parse(storedOrderData);
      setCartItems(parsedData.items);
      setTotalAmount(parsedData.total);
    } else {
      router.push('/cart');
    }
  }, [router]);

  const handleFinalizeOrder = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const orderItems = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        name: item.product.name,
        color: item.color,
        size: item.size,
        price: item.product.price,
        image: item.product.image,
      }));
  
      const orderData = {
        status: OrderStatusEnum.PENDING,
        total_price: totalAmount,
        address: userAddress,
        items: orderItems,
      };
  
      const createdOrder = await createOrder(orderData);
  
      // Save the order to localStorage for use on the success page
      localStorage.setItem('orderDetails', JSON.stringify(orderData));
  
      // Navigate to the success page with the order ID
      router.push(`/success/${createdOrder.id}`);
    } catch (err: any) {
      setError('Failed to place the order. Please try again later.');
      console.error('Order creation failed:', err.message || err);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-[#0097B2] text-center mb-6">
          Confirm Your Order
        </h1>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Items:</h2>
          <ul className="space-y-4">
            {cartItems.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center space-x-4">
                  {item.product.image ? (
                    <Image
                      src={item.product.image} 
                      alt={item.product.name || 'Product image'}
                      className="w-16 h-16 rounded-md object-cover border"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-black">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × €{item.product.price.toFixed(2)} | Size: {item.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                  ></div>
                  <p className="font-medium">
                    €{(item.quantity * item.product.price).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-end">
            <p className="text-lg font-bold">Total: €{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6">
          <AddressManager />
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => router.back()}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Back to Cart
          </button>
          <button
            onClick={handleFinalizeOrder}
            disabled={isLoading}
            className={`px-6 py-2 bg-[#0097B2] text-white rounded-md hover:bg-teal-500 transition-all ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Finalizing...' : 'Finalize Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
