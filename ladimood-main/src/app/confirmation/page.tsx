"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCart,
  removeFromCart,
  createOrder,
  // clearCart, // If this doesn't work, we remove items individually
} from '@/api/account/axios';
import { OrderStatusEnum } from '../types/types';
import Image from 'next/image';
import AddressManager from '@/components/Account/AddressManager';
import withAuth from "@/components/Authentication/HOC/withAuth";

const ConfirmationPage: React.FC = () => {
  const router = useRouter();

  // Local state for cart items and totals
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Other states
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 1. Fetch the cart from the backend, just like in your Shop component
   */
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await getCart();
        if (response && response.items) {
          setCartItems(response.items);

          // Calculate total
          const newTotal = response.items.reduce(
            (sum: number, item: any) => sum + item.product.price * item.quantity,
            0
          );
          setTotalAmount(newTotal);
        } else {
          // If the cart is empty, redirect back to cart page
          router.push('/cart');
        }
      } catch (error) {
        console.error('Failed to load cart items:', error);
        setError('Failed to load cart items. Please try again.');
      }
    };

    fetchCartItems();
  }, [router]);

  /**
   * 2. Finalize order when user confirms
   */
  const handleFinalizeOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare order items for the createOrder call
      const orderItems = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        name: item.product.name,
        color: item.color,
        size: item.size,
        price: item.product.price,
        image: item.product.image_url,
      }));

      // Construct the order payload
      const orderData = {
        status: OrderStatusEnum.PENDING,
        total_price: totalAmount,
        address: userAddress,
        items: orderItems,
      };

      // 1) Create the order
      const createdOrder = await createOrder(orderData);

      // 2) Remove each item from cart individually
      for (const item of cartItems) {
        await removeFromCart(item.id, item.color, item.size);
      }

      // 3) Clear the cart from local state
      setCartItems([]);

      // (Optional) Save order data to localStorage if you want to pass info to success page
      localStorage.setItem('orderDetails', JSON.stringify(orderData));

      // 4) Redirect to success page
      router.push(`/success/${createdOrder.id}`);
    } catch (err: any) {
      setError('Failed to place the order. Please try again later.');
      console.error('Order creation failed:', err.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 3. Render the confirmation page
   */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-[#0097B2] text-center mb-6">
          Confirm Your Order
        </h1>

        {/* Cart Items Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Items:</h2>
          {cartItems && cartItems.length > 0 ? (
            <ul className="space-y-4">
              {cartItems.map((item, index) => (
                <li key={index} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
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
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="font-medium">
                      €{(item.quantity * item.product.price).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Your cart is empty.</p>
          )}

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
            disabled={isLoading || cartItems.length === 0}
            className={`px-6 py-2 bg-[#0097B2] text-white rounded-md hover:bg-teal-500 transition-all ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Finalizing...' : 'Finalize Order'}
          </button>
        </div>

        {error && (
          <div className="mt-4 text-center text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(ConfirmationPage);
