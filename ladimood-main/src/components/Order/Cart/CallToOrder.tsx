import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {

  SizeEnum,
  CallToOrderProps,
  OrderStatusEnum,
  OrderItemCreate,
  OrderCreate,
} from '@/app/types/types';
import { createOrder } from '@/api/account/axios';

const CallToOrder: React.FC<CallToOrderProps> = ({ cartItems, onOrder, onCancel }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cartItems.length === 0) {
    return <div className="text-center text-gray-600">Your cart is empty.</div>;
  }

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const handleOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const orderItems: OrderItemCreate[] = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size as SizeEnum,
        price: item.product.price,
      }));

      const orderData: OrderCreate = {
        status: OrderStatusEnum.PENDING,
        total_price: totalAmount,
        items: orderItems,
      };

      const createdOrder = await createOrder(orderData);

      if (typeof onOrder === 'function') onOrder();

      
      const hashedOrderId = createdOrder.id;
      router.push(`/order/${hashedOrderId}`);
    } catch (err: any) {
      setError('Failed to place the order. Please try again later.');
      console.error('Order creation failed:', err.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Ready to Order?</h2>
          <p className="text-gray-600">You have {cartItems.length} items in your cart.</p>
          <p className="text-gray-800 font-bold">Total: €{totalAmount.toFixed(2)}</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleOrder}
            disabled={isLoading}
            className={`px-4 py-2 bg-[#0097B2] text-white rounded-md hover:bg-teal-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Processing...' : 'Place Order'}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallToOrder;
