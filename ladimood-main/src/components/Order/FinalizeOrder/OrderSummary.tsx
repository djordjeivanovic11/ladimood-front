import React, { useEffect, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useRouter, useParams } from 'next/navigation';
import { getCart} from '@/api/account/axios';
import {
  CartItem as CartItemType
} from '@/app/types/types';

const OrderSummary: React.FC = () => {
  const router = useRouter();
  const { orderId } = useParams();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cart = await getCart();
        setCartItems(cart.items);
      } catch (err: any) {
        console.error('Error fetching cart:', err);
        setError('Failed to fetch cart details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <p>Loading cart details...</p>
      </div>
    );
  }

  if (error || cartItems.length === 0) {
    return (
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <p className="text-red-500">{error || 'Your cart is empty.'}</p>
      </div>
    );
  }

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0
    );
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      router.push(`/confirmation/${orderId}`);
    } catch (err: any) {
      console.error('Error processing order:', err);
      setError('Failed to process the order.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <FaShoppingCart className="text-[#0097B2]" />
          <span>Order Summary</span>
        </h2>
      </div>
      <ul className="space-y-4">
        {cartItems.map((item) => {
          const itemPrice = Number(item.product.price);
          return (
            <li
              key={`${item.id}-${item.color}-${item.size}`}
              className="flex justify-between items-center"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{item.product.name}</span>
                <span className="text-sm text-gray-500">
                  Qty: {item.quantity} | Color: {item.color} | Size: {item.size}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                €{(itemPrice * item.quantity).toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>
      <hr className="my-6 border-t border-gray-200" />
      <div className="flex justify-between items-center text-xl font-semibold text-gray-900">
        <span>Total:</span>
        <span>€{calculateTotal().toFixed(2)}</span>
      </div>
      <div className="mt-6">
        <button
          onClick={handleConfirmOrder}
          className={`px-6 py-3 rounded-lg text-white font-semibold ${
            isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0097B2] hover:bg-[#007a91]'
          }`}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Get Email Confirmation'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default OrderSummary;
