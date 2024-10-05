import React, { useEffect, useState } from 'react';
import { getOrderById } from '@/api/account/axios';
import { Order } from '@/app/types/types';
import {decodeOrderId} from '@/utils/OrderDecoder';
interface OrderDetailsProps {
  orderId: number;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const decodedOrderId = decodeOrderId(orderId.toString());
        if (decodedOrderId === null) {
          throw new Error('Invalid order ID');
        }
        const orderData = await getOrderById(decodedOrderId.toString());
        setOrder(orderData);
      } catch (err) {
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading order details...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!order) {
    return <div className="text-center text-gray-500">Order not found.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
      <p className="text-gray-700">Date: {new Date(order.created_at).toLocaleDateString()}</p>
      <p className="text-gray-700">Total: €{order.total_price.toFixed(2)}</p>
      
      {/* Order Items */}
      <div>
        <h3 className="text-lg font-semibold">Items</h3>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <span>{item.product.name} (x{item.quantity})</span>
                <span className="text-gray-700">€{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600">Color: {item.color}, Size: {item.size}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Order Status */}
      <div>
        <h3 className="text-lg font-semibold">Order Status</h3>
        <p className="text-gray-700">{order.status}</p>
      </div>

      {/* Close button */}
      <div className="text-center mt-4">
        <button
          onClick={onClose}
          className="bg-[#0097B2] text-white px-4 py-2 rounded-lg shadow hover:bg-[#007A90] transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
