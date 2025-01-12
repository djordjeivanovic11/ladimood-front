'use client';

import React from 'react';
import Image from 'next/image';
import type { OrderItem } from '@/app/types/types';

interface OrderItemProps {
  item: OrderItem;
}

const OrderItem: React.FC<OrderItemProps> = ({ item }) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      {/* Product Details */}
      <div className="flex-1 mt-4 md:mt-0 md:ml-6">
        <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300">
          {item.product_name}
        </h3>
        <ul className="mt-2 space-y-2 text-gray-600">
          <li>
            <strong>Quantity:</strong> {item.quantity}
          </li>
          <li className="flex items-center">
            <strong className="mr-2">Color:</strong>
            {item.color ? (
              <span
                className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: item.color }}
                title={item.color}
              />
            ) : (
              <span className="text-gray-500">N/A</span>
            )}
          </li>
          <li>
            <strong>Size:</strong> {item.size || 'N/A'}
          </li>
          <li>
            <strong>Price:</strong>{' '}
            <span className="text-green-600">${item.price.toFixed(2)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OrderItem;
