import React, { useState, useEffect } from 'react';
import { fetchAllOrdersWithDetails, updateOrderStatus } from '@/api/management/axios';
import { OrderManagement, OrderStatusEnum } from '@/app/types/types';
import StatusManagement from './StatusManagement';

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderManagement[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderManagement[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState<string>(''); 
  const [endDate, setEndDate] = useState<string>(''); 
  const [statusFilter, setStatusFilter] = useState<string>(''); 

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const ordersData = await fetchAllOrdersWithDetails();
        setOrders(ordersData);
        setFilteredOrders(ordersData); // Show all orders initially
        setError(null);
      } catch (error) {
        setError('Failed to fetch orders. Please try again later.');
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrdersData();
  }, []);

  // Handle status updates for an individual order
  const handleStatusChange = async (orderId: number, newStatus: OrderStatusEnum) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update both the 'orders' array and 'filteredOrders' array for consistency
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
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  };

  // Apply filters when the user clicks the "Apply Filters" button
  const applyFilters = () => {
    // Start with the complete list of orders
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

    // Update the filteredOrders state
    setFilteredOrders(updatedFilteredOrders);
  };

  // Helper function for dynamic badge colors
  const getStatusStyles = (status: string) => {
    switch (status) {
      case OrderStatusEnum.CREATED:
        return 'bg-gray-200 text-gray-800';
      case OrderStatusEnum.PENDING:
        return 'bg-yellow-200 text-yellow-800';
      case OrderStatusEnum.SHIPPED:
        return 'bg-blue-200 text-blue-800';
      case OrderStatusEnum.DELIVERED:
        return 'bg-green-200 text-green-800';
      case OrderStatusEnum.CANCELLED:
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-[#0097B2]">Orders Management</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-6 bg-white p-6 rounded-md shadow-md space-y-6">
        <h3 className="text-xl font-semibold text-[#0097B2]">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              title="Start Date"
              type="date"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              title="End Date"
              type="date"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <select
                title="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              >
                <option value="">All</option>
                {Object.values(OrderStatusEnum).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Only display the selected status badge */}
              {statusFilter && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(
                    statusFilter
                  )}`}
                >
                  {statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}
                </span>
              )}
            </div>
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
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">No orders match the selected filters.</p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-lg p-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">
                    User:
                    <span className="font-normal ml-1">
                      {order.user
                        ? `${order.user.full_name} (${order.user.email})`
                        : 'N/A'}
                    </span>
                  </p>
                  <p className="font-medium">
                    Address:
                    <span className="font-normal ml-1">
                      {order.address
                        ? `${order.address.street_address}, ${order.address.city}, ${order.address.country}`
                        : 'N/A'}
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
              <div className="mt-4">
                <h4 className="text-lg font-medium text-[#0097B2]">Items:</h4>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item.id} className="ml-4">
                      {item.product_name} - {item.quantity} x ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
