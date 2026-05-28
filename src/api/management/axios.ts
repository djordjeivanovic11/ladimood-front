import axios from 'axios';
import axiosInstance from '../axiosInstance';
import {
  AddressManagement,
  Order,
  SalesRecord,
  OrderStatusEnum,
  OrderManagement,
  OrderResponse,
} from '@/app/types/types';

function getAxiosDetail(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data;
  if (!data || typeof data !== 'object' || !('detail' in data)) return null;

  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === 'string' && detail.trim()) return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const entry = item as { msg?: string; loc?: unknown[] };
        const field =
          Array.isArray(entry.loc) && entry.loc.length > 0
            ? String(entry.loc[entry.loc.length - 1])
            : null;
        if (entry.msg && field) return `${field}: ${entry.msg}`;
        return entry.msg ?? null;
      })
      .filter((msg): msg is string => Boolean(msg));
    if (messages.length > 0) return messages.join(' ');
  }

  return null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return getAxiosDetail(error) ?? (error instanceof Error ? error.message : fallback);
}

export const fetchSalesRecords = async (): Promise<SalesRecord[]> => {
  try {
    const response = await axiosInstance.get<SalesRecord[]>('/admin/sales');
    return response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Učitavanje evidencije prodaje nije uspjelo.');
    console.error('Error fetching sales records:', message);
    throw new Error(message);
  }
};

export const createSalesRecord = async (salesRecord: {
  user_id: number;
  order_id: number;
  date_of_sale: string;
  buyer_name: string;
  price: number;
}): Promise<SalesRecord | null> => {
  try {
    const response = await axiosInstance.post<SalesRecord>('/admin/sales', salesRecord);
    return response.data;
  } catch (error: unknown) {
    const detail = getAxiosDetail(error);
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 400 &&
      detail?.includes('already exists')
    ) {
      console.warn(
        'A sales record for this order already exists. Returning null instead of throwing.'
      );
      return null;
    }
    const message = getErrorMessage(error, 'Kreiranje evidencije prodaje nije uspjelo.');
    console.error('Error creating sales record:', message);
    throw new Error(message);
  }
};

// Orders API
export const fetchAllOrdersWithDetails = async (): Promise<OrderManagement[]> => {
  try {
    const response = await axiosInstance.get<OrderManagement[]>('/admin/orders');
    return response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Učitavanje porudžbina nije uspjelo.');
    console.error('Error fetching orders with details:', message);
    throw new Error(message);
  }
};

export interface AdminUserOverview {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string | null;
  is_active: boolean;
  role_name?: string | null;
  created_at: string;
  address?: AddressManagement | null;
  order_count: number;
  total_spent: number;
  last_order_at?: string | null;
  last_order_status?: OrderStatusEnum | null;
}

export interface DashboardSummary {
  users_count: number;
  addresses_count: number;
  orders_count: number;
  sales_count: number;
  delivered_orders_count: number;
  completion_rate: number;
  total_sales_amount: number;
  status_counts: Record<string, number>;
}

export const fetchAdminUsersOverview = async (): Promise<AdminUserOverview[]> => {
  try {
    const response = await axiosInstance.get<AdminUserOverview[]>('/admin/users');
    return response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Učitavanje pregleda korisnika nije uspjelo.');
    console.error('Error fetching admin users overview:', message);
    throw new Error(message);
  }
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const response = await axiosInstance.get<DashboardSummary>('/admin/dashboard/summary');
    return response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Učitavanje sažetka table nije uspjelo.');
    console.error('Error fetching dashboard summary:', message);
    throw new Error(message);
  }
};

export const fetchOrderDetailsById = async (orderId: number): Promise<OrderResponse> => {
  try {
    const response = await axiosInstance.get<OrderResponse>(`/admin/orders/${orderId}`);
    return response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(
      error,
      `Učitavanje detalja porudžbine ID ${orderId} nije uspjelo.`
    );
    console.error(`Error fetching order details with ID ${orderId}:`, message);
    throw new Error(message);
  }
};

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatusEnum
): Promise<Order> => {
  try {
    const response = await axiosInstance.put<Order>(
      `/admin/orders/${orderId}/status`,
      { status } // Correct payload structure
    );
    return response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(
      error,
      `Ažuriranje statusa porudžbine ID ${orderId} nije uspjelo.`
    );
    console.error(`Error updating status for order with ID ${orderId}:`, message);
    throw new Error(message);
  }
};

export const deleteOrder = async (orderId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/admin/orders/${orderId}`);
  } catch (error: unknown) {
    const message = getErrorMessage(error, `Brisanje porudžbine ID ${orderId} nije uspjelo.`);
    console.error(`Error deleting order with ID ${orderId}:`, message);
    throw new Error(message);
  }
};

export const submitContactForm = async (contactData: {
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiry_type: string;
  attachment?: File | null;
}): Promise<{ message: string }> => {
  try {
    const payload = new FormData();
    payload.append('name', contactData.name);
    payload.append('email', contactData.email);
    payload.append('phone', contactData.phone);
    payload.append('message', contactData.message);
    payload.append('inquiry_type', contactData.inquiry_type);
    if (contactData.attachment) {
      payload.append('attachment', contactData.attachment);
    }

    const response = await axiosInstance.post<{ message: string }>(
      '/notifications/contact',
      payload
    );
    return response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Slanje kontakt forme nije uspjelo.');
    console.error('Error submitting contact form:', message);
    throw new Error(message);
  }
};
