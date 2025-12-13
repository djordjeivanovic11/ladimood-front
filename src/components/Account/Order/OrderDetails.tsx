import React, { useEffect, useState } from "react";
import { getOrderById } from "@/api/account/axios";
import { Order } from "@/app/types/types";
import { decodeOrderId } from "@/utils/OrderDecoder";

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
        if (!decodedOrderId) throw new Error("Invalid order ID");

        const orderData = await getOrderById(decodedOrderId.toString());
        setOrder(orderData);
      } catch (err) {
        setError("Failed to fetch order details.");
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
    <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 border border-gray-200 max-w-3xl mx-auto">
      {/* Order Header */}
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Order #{order.id}</h2>
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Date:</span>{" "}
          {new Date(order.created_at).toLocaleDateString()}
        </p>
        <p>
          <span className="font-medium">Total:</span> €{order.total_price.toFixed(2)}
        </p>
      </div>

      {/* Order Items */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Items</h3>
        <ul className="space-y-4">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex-1">
                {/* Product Details */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-800">
                    {item.product.name} (x{item.quantity})
                  </span>
                  <span className="text-gray-700">
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  {/* Color */}
                  <div className="flex items-center">
                    <span className="font-medium text-sm text-gray-600">Color:</span>
                    <span
                      className="w-5 h-5 rounded-full border border-black ml-2"
                      style={{ backgroundColor: item.color || "#FFFFFF" }}
                      title={`Color: ${item.color}`}
                    ></span>
                  </div>
                  {/* Size */}
                  <div className="flex items-center">
                    <span className="font-medium text-sm text-gray-600">Size:</span>
                    <span className="text-sm font-semibold ml-2">{item.size}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Order Status */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Order Status</h3>
        <p className="text-sm text-gray-700">{order.status}</p>
      </div>

      {/* Close Button */}
      <div className="text-center mt-8">
        <button
          onClick={onClose}
          className="bg-[#0097B2] text-white px-6 py-2 rounded-md shadow-md hover:bg-[#007A90] transition-all duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
