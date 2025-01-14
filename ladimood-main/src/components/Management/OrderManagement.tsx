import React, { useState, useEffect } from "react";
import {
  fetchAllOrdersWithDetails,
  updateOrderStatus,
  createSalesRecord,
} from "@/api/management/axios";
import { OrderManagement, OrderStatusEnum } from "@/app/types/types";
import StatusManagement from "./StatusManagement";

type SaleFinalizedStatus = "none" | "finalized" | "exists" | "failed";

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderManagement[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderManagement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error" | null>(null);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchOrderId, setSearchOrderId] = useState<string>("");
  const [searchOrderName, setSearchOrderName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // This map will track the finalized status of each order by its id.
  // Alternatively, you could augment your OrderManagement type to include this field directly.
  const [saleFinalizedStatusMap, setSaleFinalizedStatusMap] = useState<{
    [orderId: number]: SaleFinalizedStatus;
  }>({});

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const ordersData = await fetchAllOrdersWithDetails();
        const sortedOrders = ordersData.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);

        // Initialize the saleFinalizedStatus for all fetched orders to 'none'.
        const initialStatusMap: { [orderId: number]: SaleFinalizedStatus } = {};
        sortedOrders.forEach((order) => {
          initialStatusMap[order.id] = "none";
        });
        setSaleFinalizedStatusMap(initialStatusMap);

        setError(null);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrdersData();
  }, []);

  const handleStatusChange = async (
    orderId: number,
    newStatus: OrderStatusEnum
  ) => {
    try {
      await updateOrderStatus(orderId, newStatus);
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
        setAlertMessage("A sales record for this order already exists.");
        setAlertType("error");
        // Mark this order as 'exists'
        setSaleFinalizedStatusMap((prev) => ({
          ...prev,
          [order.id]: "exists",
        }));
      } else {
        setAlertMessage("Sale finalized and sales record created successfully!");
        setAlertType("success");
        // Mark this order as 'finalized'
        setSaleFinalizedStatusMap((prev) => ({
          ...prev,
          [order.id]: "finalized",
        }));
      }
    } catch (err: any) {
      console.error("Error finalizing sale:", err);
      setAlertMessage("Failed to finalize the sale. Please try again.");
      setAlertType("error");
      // Mark this order as 'failed'
      setSaleFinalizedStatusMap((prev) => ({
        ...prev,
        [order.id]: "failed",
      }));
    }
  };

  const applyFilters = () => {
    let updatedFilteredOrders = [...orders];
    if (startDate) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => new Date(order.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => new Date(order.created_at) <= new Date(endDate)
      );
    }
    if (statusFilter) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => order.status === statusFilter
      );
    }
    if (searchOrderId) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => order.id.toString() === searchOrderId.trim()
      );
    }
    if (searchOrderName) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) =>
          order.user &&
          order.user.full_name
            .toLowerCase()
            .includes(searchOrderName.toLowerCase().trim())
      );
    }
    setFilteredOrders(updatedFilteredOrders);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleViewOrderClick = (orderId: number) => {
    // Navigate to the order details page
    window.location.href = `/order/${orderId}`;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-[#0097B2]">
        Orders Management
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      <div className="mb-6 bg-white p-6 rounded-md shadow-md space-y-6">
        <h3 className="text-xl font-semibold text-[#0097B2]">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Order ID
            </label>
            <input
              type="text"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search by Order ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Order Name
            </label>
            <input
              type="text"
              value={searchOrderName}
              onChange={(e) => setSearchOrderName(e.target.value)}
              className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search by Order Name"
            />
          </div>
        </div>
        <button
          onClick={applyFilters}
          className="w-full md:w-auto px-6 py-2 bg-[#0097B2] text-white font-semibold rounded-md hover:bg-[#007a99] transition-colors duration-200"
        >
          Apply Filters
        </button>
      </div>
      <div className="space-y-6 text-black">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">
            No orders match the selected filters.
          </p>
        ) : (
          currentOrders.map((order) => (
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


              <div className="mt-4">
                <h4 className="text-lg font-medium text-[#0097B2]">Items:</h4>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item.id} className="ml-4 flex items-center">
                      {item.product_name} - {item.quantity} x $
                      {item.price.toFixed(2)} |
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300 shadow-sm inline-block mx-2"
                        style={{ backgroundColor: item.color || "#FFFFFF" }}
                        title={item.color || "N/A"}
                      ></span>
                      {item.size || "N/A"}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Finalized sale status badge */}
              <div className="mt-4">
                {saleFinalizedStatusMap[order.id] === "finalized" && (
                  <span className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded">
                    Sale Finalized
                  </span>
                )}
                {saleFinalizedStatusMap[order.id] === "exists" && (
                  <span className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded">
                    Sale Already Exists
                  </span>
                )}
                {saleFinalizedStatusMap[order.id] === "failed" && (
                  <span className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded">
                    Finalization Failed
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Finalize Sale Button */}
                <button
                  onClick={() => handleFinalizeSale(order)}
                  className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-300"
                >
                  Finalize Sale
                </button>
                {/* View Full Order Button */}
                <button
                  onClick={() => handleViewOrderClick(order.id)}
                  className="w-full md:w-auto px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
                >
                  View Full Order
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {filteredOrders.length > itemsPerPage && (
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex -space-x-px">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 ml-0 leading-tight ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-300"
              } border border-gray-300 rounded-l-lg`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-2 leading-tight border border-gray-300 ${
                  currentPage === number
                    ? "text-white bg-gray-700"
                    : "text-gray-700 hover:bg-gray-300"
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 leading-tight ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-300"
              } border border-gray-300 rounded-r-lg`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
