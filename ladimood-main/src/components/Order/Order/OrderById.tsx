'use client';

import React, { useEffect, useState } from 'react';
import { OrderManagement, OrderStatusEnum } from '@/app/types/types';
import { fetchOrderDetailsById } from '@/api/management/axios';
import { FaUser, FaTruck, FaBoxOpen } from 'react-icons/fa';
import OrderItem from './OrderItem';

interface OrderByIdProps {
  orderId: number;
}

const OrderById: React.FC<OrderByIdProps> = ({ orderId }) => {
  const [order, setOrder] = useState<OrderManagement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const fetchedOrder = await fetchOrderDetailsById(orderId);
        setOrder({
          ...fetchedOrder,
          created_at: new Date(fetchedOrder.created_at).toISOString(),
          updated_at: new Date(fetchedOrder.updated_at).toISOString(),
          items: fetchedOrder.items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name || 'Unknown Product',
            quantity: item.quantity,
            color: item.color || 'Unknown Color',
            size: item.size || 'Unknown Size',
            price: item.price || 0,
            product: item.product
          })),
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-lg">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl shadow-lg p-8 md:p-12">
      {/* Order Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          Order #{order.id}
        </h1>
        <span
          className={`mt-4 md:mt-0 px-6 py-2 rounded-full font-semibold text-sm ${
            order.status === OrderStatusEnum.DELIVERED
              ? 'bg-green-100 text-green-800'
              : order.status === OrderStatusEnum.SHIPPED
              ? 'bg-blue-100 text-blue-800'
              : order.status === OrderStatusEnum.PENDING
              ? 'bg-yellow-100 text-yellow-800'
              : order.status === OrderStatusEnum.CANCELLED
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
            <FaUser className="mr-2 text-blue-500" /> User Information
          </h2>
          {order.user && (
            <>
              <p className="text-gray-600">
                <strong>Name:</strong> {order.user.full_name}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {order.user.email}
              </p>
              {order.user.phone_number && (
                <p className="text-gray-600">
                  <strong>Phone:</strong> {order.user.phone_number}
                </p>
              )}
            </>
          )}
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
            <FaTruck className="mr-2 text-green-500" /> Shipping Address
          </h2>
          {order.address && (
            <>
              <p className="text-gray-600">{order.address.street_address}</p>
              <p className="text-gray-600">
                {order.address.city}, {order.address.state || ''}{' '}
                {order.address.postal_code}
              </p>
              <p className="text-gray-600">{order.address.country}</p>
            </>
          )}
        </div>

        {/* Order Meta */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
            <FaBoxOpen className="mr-2 text-yellow-500" /> Order Details
          </h2>
          <p className="text-gray-600">
            <strong className="">Created At:</strong>{' '}
            {new Date(order.created_at).toLocaleString()}
          </p>
          <p className="text-gray-600">
            <strong>Total Price:</strong>{' '}
            <span className="text-green-600 font-semibold">
              ${order.total_price.toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Items</h2>
        <div className="space-y-6">
          {order.items.map((item) => (
            <OrderItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderById;
