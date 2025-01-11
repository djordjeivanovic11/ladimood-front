import React, { useState, useEffect } from 'react';
import { fetchSalesRecords } from '@/api/management/axios';
import { SalesRecord} from '@/app/types/types';
const SalesManagement: React.FC = () => {
    const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSalesRecords();
        setSalesRecords(data);
      } catch (error) {
        setError('Failed to fetch sales records. Please try again.');
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

      {isLoading && <p className="text-gray-500">Loading sales records...</p>}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && salesRecords.length === 0 && (
        <p className="text-gray-500">No sales records available.</p>
      )}

      {!isLoading && !error && salesRecords.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {salesRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.user_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <ul>
                      {record.items.map((item, index) => (
                        <li key={index}>
                          {item.product_name} - {item.quantity} x ${item.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;
