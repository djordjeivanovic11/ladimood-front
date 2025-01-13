import axiosInstance from '../axiosInstance';
import { Order, SalesRecord, OrderStatusEnum, OrderManagement} from '@/app/types/types';

export const fetchSalesRecords = async (): Promise<SalesRecord[]> => {
  try {
    const response = await axiosInstance.get<SalesRecord[]>('/management/sales');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sales records:', error?.response?.data?.detail || error.message);
    throw new Error(error?.response?.data?.detail || 'Failed to fetch sales records.');
  }
}

export const createSalesRecord = async (salesRecord: {
  user_id: number;
  order_id: number;
  date_of_sale: string;
  buyer_name: string;
  price: number;
}): Promise<SalesRecord | null> => {
  try {
    const response = await axiosInstance.post<SalesRecord>('/management/sales', salesRecord);
    return response.data;
  } catch (error: any) {
    // Check for the "already exists" case
    if (error?.response?.status === 400 && error?.response?.data?.detail) {
      if (error.response.data.detail.includes('already exists')) {
        console.warn('A sales record for this order already exists. Returning null instead of throwing.');
        return null; 
      }
    }
    console.error('Error creating sales record:', error?.response?.data?.detail || error.message);
    throw new Error(error?.response?.data?.detail || 'Failed to create sales record.');
  }
};



// Orders API
export const fetchAllOrdersWithDetails = async (): Promise<OrderManagement[]> => {
  try {
    const response = await axiosInstance.get<OrderManagement[]>('/management/orders');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching orders with details:', error?.response?.data?.detail || error.message);
    throw new Error(error?.response?.data?.detail || 'Failed to fetch orders with details.');
  }
};

export const fetchOrderDetailsById = async (orderId: number): Promise<Order> => {
  try {
    const response = await axiosInstance.get<Order>(`/management/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching order details with ID ${orderId}:`, error?.response?.data?.detail || error.message);
    throw new Error(error?.response?.data?.detail || `Failed to fetch order details with ID ${orderId}.`);
  }
};

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatusEnum
): Promise<Order> => {
  try {
    const response = await axiosInstance.put<Order>(
      `/management/orders/${orderId}/status`,
      { status } // Correct payload structure
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating status for order with ID ${orderId}:`,
      error?.response?.data?.detail || error.message
    );
    throw new Error(
      error?.response?.data?.detail ||
        `Failed to update order status for ID ${orderId}.`
    );
  }
};


export const submitContactForm = async (contactData: {
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiry_type: string;
}): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post<{ message: string }>('/management/contact', contactData);
    return response.data;
  } catch (error: any) {
    console.error(`Error submitting contact form:`, error?.response?.data?.detail || error.message);
    throw new Error(error?.response?.data?.detail || `Failed to submit contact form.`);
  }
};