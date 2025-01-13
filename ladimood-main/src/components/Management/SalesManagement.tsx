import React, { useState, useEffect } from 'react';
import { fetchSalesRecords } from '@/api/management/axios';
import { SalesRecord } from '@/app/types/types';

const SalesManagement: React.FC = () => {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSales = salesRecords.reduce((total, record) => total + record.price, 0);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSalesRecords();
        // Sort sales records by date_of_sale in descending order
        const sortedData = data.sort(
          (a: SalesRecord, b: SalesRecord) => new Date(b.date_of_sale).getTime() - new Date(a.date_of_sale).getTime()
        );
        setSalesRecords(sortedData);
      } catch (error) {
        setError('Failed to fetch sales records. Please try again later.');
        console.error('Error fetching sales records:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchRecords();
  }, []);
  

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-[#0097B2] mb-4">Sales Records</h2>

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

      {!isLoading && !error && salesRecords.length === 0 && (
        <p className="text-gray-500 text-center">No sales records available.</p>
      )}

      {!isLoading && !error && salesRecords.length > 0 && (
        <div className="overflow-x-auto">
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
              {salesRecords.map((record) => (
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
        </div>
      )}
    </div>
  );
};

export default SalesManagement;
