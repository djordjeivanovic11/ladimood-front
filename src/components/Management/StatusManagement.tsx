import React, { useEffect, useState } from 'react';
import { OrderStatusEnum } from '@/app/types/types';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatusManagementProps {
  orderId: number;
  currentStatus: OrderStatusEnum;
  onStatusChange: (orderId: number, newStatus: OrderStatusEnum) => Promise<void>;
}

const statusLabels: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.CREATED]: 'Kreirano',
  [OrderStatusEnum.PENDING]: 'Na čekanju',
  [OrderStatusEnum.SHIPPED]: 'Poslato',
  [OrderStatusEnum.DELIVERED]: 'Dostavljeno',
  [OrderStatusEnum.CANCELLED]: 'Otkazano',
};

const StatusManagement: React.FC<StatusManagementProps> = ({
  orderId,
  currentStatus,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<OrderStatusEnum>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusUpdate = async (newStatus: OrderStatusEnum) => {
    if (newStatus === status) return;

    setIsLoading(true);
    setError(null);

    try {
      await onStatusChange(orderId, newStatus);
      setStatus(newStatus);
    } catch (err) {
      setError('Ažuriranje statusa nije uspjelo. Pokušajte ponovo.');
      console.error('Error updating status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyles = (statusValue: OrderStatusEnum) => {
    switch (statusValue) {
      case OrderStatusEnum.CREATED:
        return 'bg-muted text-muted-foreground';
      case OrderStatusEnum.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200';
      case OrderStatusEnum.SHIPPED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200';
      case OrderStatusEnum.DELIVERED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200';
      case OrderStatusEnum.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-2">
      <Badge className={getStatusStyles(status)} variant="outline">
        Trenutni status: {statusLabels[status]}
      </Badge>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Select
        value={status}
        onValueChange={(value) => void handleStatusUpdate(value as OrderStatusEnum)}
        disabled={isLoading}
      >
        <SelectTrigger aria-label={`Promijeni status porudžbine ${orderId}`} className="w-[220px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(OrderStatusEnum).map((statusOption) => (
            <SelectItem key={statusOption} value={statusOption}>
              {statusLabels[statusOption]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusManagement;
