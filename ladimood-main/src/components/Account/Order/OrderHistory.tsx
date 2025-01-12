import React, { useEffect, useState } from "react";
import { getUserOrders } from "@/api/account/axios";
import { Order, OrderItem } from "@/app/types/types";

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders();
        // Sort orders by date (latest first)
        const sortedOrders = data.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOrders(sortedOrders);
      } catch (err) {
        setError("Failed to fetch order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-sm text-gray-400">Loading your orders...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200 max-w-3xl mx-auto my-10">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Order History
      </h2>
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-[#0097B2]">
                    Order #{order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Placed on: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    Total: €{order.total_price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-base font-medium text-gray-800 mb-3">
                  Items
                </h3>
                <ul className="space-y-3">
                  {order.items.map((item: OrderItem) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                          <span className="ml-4">Size: {item.size}</span>
                        </p>
                        <div className="flex items-center mt-1">
                          <p className="text-sm text-gray-600">Color:</p>
                          <span
                            className="w-4 h-4 rounded-full ml-2 border border-gray-300"
                            style={{ backgroundColor: item.color || "#FFFFFF" }}
                          ></span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        €{item.price.toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-[#0097B2] text-base font-medium">
          You have no orders yet. Start shopping and make your first purchase!
        </p>
      )}
    </div>
  );
};

export default OrderHistory;
