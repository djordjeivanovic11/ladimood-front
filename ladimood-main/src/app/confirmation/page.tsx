'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, getCurrentUser } from '@/api/account/axios';
import { OrderStatusEnum } from '../types/types';
import AddressManager from '@/components/Account/AddressManager';

const ConfirmationPage: React.FC = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Load cart data from sessionStorage on mount
  useEffect(() => {
    const storedOrderData = sessionStorage.getItem('orderData');
    if (storedOrderData) {
      const parsedData = JSON.parse(storedOrderData);
      setCartItems(parsedData.items);
      setTotalAmount(parsedData.total);
    } else {
      router.push('/cart'); // Redirect to cart if no data found
    }
  }, [router]);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      getCurrentUser()
        .then((user) => {
          if (!user) {
            setIsLoggedIn(false);
            router.push('/auth/login');
          } else {
            setIsLoggedIn(true);
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
        });
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  if (cartItems.length === 0) {
    return <div className="text-center text-gray-600">Your cart is empty.</div>;
  }

  const handleFinalizeOrder = async () => {
    if (!selectedAddress) {
      setError('Please select your shipping address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderItems = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: item.product.price,
      }));

      const orderData = {
        status: OrderStatusEnum.PENDING,
        total_price: totalAmount,
        address: selectedAddress, // Use selected address from AddressManager
        items: orderItems,
      };

      const createdOrder = await createOrder(orderData);

      // Redirect to the success page with the order ID
      router.push(`/success/${createdOrder.id}`);
    } catch (err: any) {
      setError('Failed to place the order. Please try again later.');
      console.error('Order creation failed:', err.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Confirm Your Order</h1>
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-2">Items:</h2>
          <ul className="space-y-2">
            {cartItems.map((item, index) => (
              <li key={index} className="flex justify-between">
                <div>
                  <p className="font-medium text-black">{item.product.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × €{item.product.price.toFixed(2)} | Color: {item.color} | Size: {item.size}
                  </p>
                </div>
                <p className="font-medium">€{(item.quantity * item.product.price).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <p className="text-lg font-bold">Total: €{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-medium mb-2">Shipping Address:</h2>
          <AddressManager
            onAddressSelect={(address) => setSelectedAddress(address)}
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex justify-between items-center">
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
            className={`px-4 py-2 bg-[#0097B2] text-white rounded-md hover:bg-teal-500 ${
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
