import React, { useState, useEffect } from "react";
import {
  fetchAllOrdersWithDetails,
  updateOrderStatus,
  createSalesRecord,
} from "@/api/management/axios";
import { OrderManagement, OrderStatusEnum } from "@/app/types/types";
import StatusManagement from "./StatusManagement";

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderManagement[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderManagement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | null>(null);
  // Filter states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  /**
   * Fetch all orders on component mount
   */
  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const ordersData = await fetchAllOrdersWithDetails();

        // Sort orders to show latest first
        const sortedOrders = ordersData.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders); // Initialize filtered orders with sorted orders
        setError(null);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrdersData();
  }, []);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
        setAlertType(null);
      }, 5000); // Clear message after 5 seconds
      return () => clearTimeout(timer); // Cleanup on component unmount or alert change
    }
  }, [alertMessage]);
  

  /**
   * Handle status change for an order
   */
  const handleStatusChange = async (orderId: number, newStatus: OrderStatusEnum) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      // Update both 'orders' and 'filteredOrders' to reflect the new status
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setFilteredOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setError(null);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update order status. Please try again.");
    }
  };

  /**
   * Finalize a sale by creating a sales record
   */
  const handleFinalizeSale = async (order: OrderManagement) => {
    try {
      const salesRecordData = {
        user_id: order.user_id,
        order_id: order.id,
        date_of_sale: new Date().toISOString(),
        buyer_name: order.user ? order.user.full_name : "N/A",
        price: order.total_price,
      };
  
      const result = await createSalesRecord(salesRecordData);
  
      if (result === null) {
        // Duplicate sale record
        setAlertMessage("A sales record for this order already exists.");
        setAlertType("error");
      } else {
        // Successfully created a new sales record
        setAlertMessage("Sale finalized and sales record created successfully!");
        setAlertType("success");
      }
    } catch (err: any) {
      // This catch block runs only for genuine errors (not duplicates),
      // because duplicates return `null` instead of throwing.
      console.error("Error finalizing sale:", err);
      setAlertMessage("Failed to finalize the sale. Please try again.");
      setAlertType("error");
    }
  };
  

  /**
   * Apply all selected filters
   */
  const applyFilters = () => {
    let updatedFilteredOrders = [...orders];

    // Filter by start date
    if (startDate) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => new Date(order.created_at) >= new Date(startDate)
      );
    }

    // Filter by end date
    if (endDate) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => new Date(order.created_at) <= new Date(endDate)
      );
    }

    // Filter by status
    if (statusFilter) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => order.status === statusFilter
      );
    }

    setFilteredOrders(updatedFilteredOrders);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Page Title */}
      <h2 className="text-2xl font-bold mb-6 text-[#0097B2]">
        Orders Management
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-6 bg-white p-6 rounded-md shadow-md space-y-6">
        <h3 className="text-xl font-semibold text-[#0097B2]">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Start Date Filter */}
          <div>
            <label className="block text-black text-sm font-medium">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              title="Start Date"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="text-black block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              aria-label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All</option>
              {Object.values(OrderStatusEnum).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={applyFilters}
          className="w-full md:w-auto px-6 py-2 bg-[#0097B2] text-white font-semibold rounded-md hover:bg-[#007a99] transition-colors duration-200"
        >
          Apply Filters
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6 text-black">
        {/* No Orders */}
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">
            No orders match the selected filters.
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-lg p-6">
              {/* Order Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#0097B2]">
                  Order ID: {order.id}
                </h3>
                <StatusManagement
                  orderId={order.id}
                  currentStatus={order.status}
                  onStatusChange={handleStatusChange}
                />
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">
                    User:
                    <span className="font-normal ml-1">
                      {order.user
                        ? `${order.user.full_name} (${order.user.email})`
                        : "N/A"}
                    </span>
                  </p>
                  <p className="font-medium">
                    Address:
                    <span className="font-normal ml-1">
                      {order.address
                        ? `${order.address.street_address}, ${order.address.city}, ${order.address.country}`
                        : "N/A"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="font-medium">
                    Order Date:
                    <span className="font-normal ml-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="font-medium">
                    Total Amount:
                    <span className="font-normal ml-1">
                      ${order.total_price.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
              {alertMessage && (
                  <div
                    className={`mb-4 p-4 rounded ${
                      alertType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    <p>{alertMessage}</p>
                  </div>
                )}
              {/* Order Items */}
              <div className="mt-4">
                <h4 className="text-lg font-medium text-[#0097B2]">Items:</h4>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item.id} className="ml-4">
                      {item.product_name} - {item.quantity} x $
                      {item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Finalize Sale Button */}
              <div className="mt-4">
                <button
                  onClick={() => handleFinalizeSale(order)}
                  className="w-full md:w-auto px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Finalize Sale
                </button>
                <span id="saleStatus" className="ml-4 text-green-700 font-semibold hidden">
                  Sale finalized successfully!
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
