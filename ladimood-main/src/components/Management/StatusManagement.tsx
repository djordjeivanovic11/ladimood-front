import React, { useState } from 'react';
import { OrderStatusEnum } from '@/app/types/types';

interface StatusManagementProps {
  orderId: number;
  currentStatus: OrderStatusEnum;
  onStatusChange: (orderId: number, newStatus: OrderStatusEnum) => Promise<void>;
}

const StatusManagement: React.FC<StatusManagementProps> = ({ orderId, currentStatus, onStatusChange }) => {
  const [status, setStatus] = useState<OrderStatusEnum>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (newStatus: OrderStatusEnum) => {
    if (newStatus === status) return;

    setIsLoading(true);
    setError(null);

    try {
      await onStatusChange(orderId, newStatus);
      setStatus(newStatus);
    } catch (err) {
      setError('Failed to update status. Please try again.');
      console.error('Error updating status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyles = (status: OrderStatusEnum) => {
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
    <div className="space-y-2">
      <div className={`inline-block px-4 py-1 rounded-md font-medium ${getStatusStyles(status)}`}>
        Current Status: {status.charAt(0) + status.slice(1).toLowerCase()}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <select
        aria-label={`Change status for order ${orderId}`}
        value={status}
        onChange={(e) => handleStatusUpdate(e.target.value as OrderStatusEnum)}
        disabled={isLoading}
        className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
          isLoading ? 'bg-gray-200 cursor-not-allowed' : 'focus:ring-[#0097B2]'
        }`}
      >
        {Object.values(OrderStatusEnum).map((statusOption) => (
          <option key={statusOption} value={statusOption}>
            {statusOption.charAt(0) + statusOption.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusManagement;
