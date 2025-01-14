import React, { useState, useEffect } from 'react';
import { fetchSalesRecords } from '@/api/management/axios';
import { SalesRecord } from '@/app/types/types';

const SalesManagement: React.FC = () => {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchBuyerName, setSearchBuyerName] = useState<string>("");
  const [searchOrderId, setSearchOrderId] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [itemsToShow, setItemsToShow] = useState<number>(15);

  const totalSales = filteredRecords.reduce((total, record) => total + record.price, 0);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSalesRecords();
        const sortedData = data.sort(
          (a: SalesRecord, b: SalesRecord) => new Date(b.date_of_sale).getTime() - new Date(a.date_of_sale).getTime()
        );
        setSalesRecords(sortedData);
        setFilteredRecords(sortedData);
      } catch (error) {
        setError('Failed to fetch sales records. Please try again later.');
        console.error('Error fetching sales records:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const applyFilters = () => {
    let updatedRecords = [...salesRecords];
    if (searchBuyerName.trim()) {
      updatedRecords = updatedRecords.filter(record =>
        record.buyer_name.toLowerCase().includes(searchBuyerName.toLowerCase().trim())
      );
    }
    if (searchOrderId.trim()) {
      updatedRecords = updatedRecords.filter(record =>
        record.order_id.toString() === searchOrderId.trim()
      );
    }
    if (searchDate) {
      updatedRecords = updatedRecords.filter(record =>
        new Date(record.date_of_sale).toLocaleDateString() === new Date(searchDate).toLocaleDateString()
      );
    }
    setFilteredRecords(updatedRecords);
    setItemsToShow(15);
  };

  const loadMore = () => {
    setItemsToShow(prev => prev + 15);
  };

  const loadLess = () => {
    setItemsToShow(prev => (prev - 15 >= 15 ? prev - 15 : 15));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold text-[#0097B2] mb-6">Sales Records</h2>
      {isLoading && (
        <div className="text-center">
          <p className="text-gray-500">Loading sales records...</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      <div className="mb-6 bg-white p-6 rounded-md shadow-md space-y-6">
        <h3 className="text-xl font-semibold text-[#0097B2]">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
            <input
              type="text"
              value={searchBuyerName}
              onChange={(e) => setSearchBuyerName(e.target.value)}
              className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search by Buyer Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Order ID</label>
            <input
              type="text"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search by Order ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Sale</label>
            <input
              placeholder='YYYY-MM-DD'
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-[#0097B2] text-white font-semibold rounded-md hover:bg-[#007a99] transition-colors duration-200"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setSearchBuyerName("");
              setSearchOrderId("");
              setSearchDate("");
              setFilteredRecords(salesRecords);
              setItemsToShow(15);
            }}
            className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors duration-200"
          >
            Reset Filters
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {!isLoading && !error && filteredRecords.length === 0 && (
          <p className="text-gray-500 text-center">No sales records available.</p>
        )}
        {!isLoading && !error && filteredRecords.length > 0 && (
          <>
            <table className="min-w-full bg-white border-collapse border border-gray-200">
              <thead>
                <tr>
                  {['Sale ID', 'Order ID', 'User ID', 'Buyer Name', 'Date of Sale', 'Price'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.slice(0, itemsToShow).map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.order_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.user_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.buyer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date_of_sale).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${record.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td colSpan={5} className="px-6 py-4 text-right font-semibold text-gray-700">
                    Total Sales:
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">${totalSales.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            <div className="mt-4 flex justify-center space-x-4">
              {itemsToShow < filteredRecords.length && (
                <button
                  onClick={loadMore}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Load More
                </button>
              )}
              {itemsToShow > 15 && (
                <button
                  onClick={loadLess}
                  className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors duration-200"
                >
                  Load Less
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesManagement;
