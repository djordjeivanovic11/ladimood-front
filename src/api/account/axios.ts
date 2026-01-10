import axios, { AxiosResponse } from 'axios';
import api from '../axiosInstance';
import type {
  User,
  Address,
  Cart,
  Order,
  OrderCreate,
  WishlistItem,
  MessageResponse,
  CartItem,
  CartItemCreate,
  AddressBase,
  Product,
  Category,
  Referral,
  ReferralRequest,
  Size,
} from '@/app/types/types';

function getAxiosDetail(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data;
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
  }
  return null;
}

// Function to get all products with optional filters (category, price range)
export const getProducts = async (
  category_id?: number,
  min_price?: number,
  max_price?: number
): Promise<Product[]> => {
  try {
    const params = {
      category_id: category_id || undefined,
      min_price: min_price || undefined,
      max_price: max_price || undefined,
    };

    const response: AxiosResponse<Product[]> = await api.get('/catalog/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Function to get all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response: AxiosResponse<Category[]> = await api.get('/catalog/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Function to get a single product by its ID
export const getProductById = async (productId: number): Promise<Product> => {
  try {
    const response: AxiosResponse<Product> = await api.get(`/catalog/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    throw error;
  }
};

// Helper function to set the Authorization token in requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

//-----------------------------------//
//          USER ROUTES              //
//-----------------------------------//

// Get User Details
export const getUserDetails = async (): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const fetchCurrentUser = async (): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user details:', error);
    throw error;
  }
};

//-----------------------------------//
//         ADDRESS ROUTES            //
//-----------------------------------//

// Get User Address
export const getAddress = async (): Promise<Address> => {
  try {
    const response: AxiosResponse<Address> = await api.get('/users/address');
    return response.data;
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
};

// Add or Update Address
export const setAddress = async (address: AddressBase): Promise<Address> => {
  try {
    const response: AxiosResponse<Address> = await api.post('/users/address', address);
    return response.data;
  } catch (error) {
    console.error('Error setting address:', error);
    throw error;
  }
};

// Delete Address
export const deleteAddress = async (): Promise<MessageResponse> => {
  try {
    const response: AxiosResponse<MessageResponse> = await api.delete('/users/address');
    return response.data;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

//-----------------------------------//
//          ORDER ROUTES             //
//-----------------------------------//

// Get All Orders
export const getUserOrders = async (): Promise<Order[]> => {
  try {
    const response: AxiosResponse<Order[]> = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get Specific Order using hashed order ID (string)
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const response = await api.get<Order>(`/orders/${orderId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching order:', getAxiosDetail(error) || error);
    throw new Error(getAxiosDetail(error) || 'Unable to fetch order');
  }
};

// Get Order Details (Order, Items, and Address) using hashed order ID
export const getOrderDetails = async (orderId: string): Promise<Order> => {
  try {
    const response: AxiosResponse<Order> = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order details for order ID ${orderId}:`, error);
    throw error;
  }
};

// Create an order
export const createOrder = async (order: OrderCreate): Promise<Order> => {
  try {
    const response = await api.post<Order>('/orders', order);
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating order:', getAxiosDetail(error) || error);
    throw new Error(getAxiosDetail(error) || 'Unable to create order');
  }
};

// Function to cancel an order using hashed order ID
export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    await api.delete(`/orders/${orderId}`);
  } catch (error: unknown) {
    console.error('Error canceling order:', getAxiosDetail(error) || error);
    throw new Error(getAxiosDetail(error) || 'Unable to cancel order');
  }
};
//-----------------------------------//
//         WISHLIST ROUTES           //
//-----------------------------------//

export interface AddWishlistItemRequest {
  product_id: number;
  color: string;
  size: string;
}

export const addToWishlist = async (
  wishlistItem: AddWishlistItemRequest
): Promise<WishlistItem> => {
  try {
    const response: AxiosResponse<WishlistItem> = await api.post('/wishlist', wishlistItem);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const detail = getAxiosDetail(error);
      if (detail === 'Item already in wishlist') {
        throw new Error('ItemAlreadyInWishlist'); // Use a custom error identifier
      }
      console.error('Server responded with an error:', detail || error.message);
    } else {
      console.error('Error adding to wishlist:', error);
    }

    throw error;
  }
};

// Get Wishlist (Frontend Axios Call)
export const getWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const response: AxiosResponse<WishlistItem[]> = await api.get('/wishlist');
    // Check if the wishlist is empty
    if (response.data.length === 0) {
      console.warn('Wishlist is empty');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

// Remove Item from Wishlist
export const removeFromWishlist = async (itemId: number): Promise<MessageResponse> => {
  try {
    const response: AxiosResponse<MessageResponse> = await api.delete(`/wishlist/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing item from wishlist with ID ${itemId}:`, error);
    throw error;
  }
};

//-----------------------------------//
//           CART ROUTES             //
//-----------------------------------//

// Get Cart
export const getCart = async (): Promise<Cart> => {
  try {
    const response: AxiosResponse<Cart> = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Add Item to Cart
export const addToCart = async (cartItem: CartItem): Promise<CartItem> => {
  try {
    const response: AxiosResponse<CartItem> = await api.post('/cart/items', cartItem);
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Update Cart Item

export const updateCartItem = async (cartItem: CartItem): Promise<CartItem> => {
  try {
    // Add the item_id to the URL path
    const response: AxiosResponse<CartItem> = await api.put(`/cart/items/${cartItem.id}`, {
      quantity: cartItem.quantity,
      color: cartItem.color,
      size: cartItem.size,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove Item from Cart
export const removeFromCart = async (
  itemId: number,
  _color: string,
  _size: Size
): Promise<MessageResponse> => {
  try {
    const response: AxiosResponse<MessageResponse> = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing item from cart with ID ${itemId}:`, error);
    throw error;
  }
};

export const clearCart = async (): Promise<MessageResponse> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    const response: AxiosResponse<MessageResponse> = await api.delete('/cart', {
      headers: {
        Authorization: `Bearer ${token}`, // Ensure token is sent in the Authorization header
      },
    });

    return response.data; // Message: "Cart cleared successfully"
  } catch (error: unknown) {
    console.error('Error clearing cart:', getAxiosDetail(error) || error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn('Cart is already empty.');
    }
    throw error;
  }
};

//-----------------------------------//
//         GUEST CART ROUTES          //
//-----------------------------------//

export const createGuestCart = async (): Promise<{ session_id: string; cart: Cart }> => {
  try {
    const response: AxiosResponse<{ session_id: string; cart: Cart }> =
      await api.post('/cart/guest');
    return response.data;
  } catch (error) {
    console.error('Error creating guest cart:', error);
    throw error;
  }
};

export const getGuestCart = async (sessionId: string): Promise<Cart> => {
  try {
    const response: AxiosResponse<Cart> = await api.get(`/cart/guest/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching guest cart:', error);
    throw error;
  }
};

export const addToGuestCart = async (
  sessionId: string,
  item: CartItemCreate
): Promise<CartItem> => {
  try {
    const response: AxiosResponse<CartItem> = await api.post(
      `/cart/guest/${sessionId}/items`,
      item
    );
    return response.data;
  } catch (error) {
    console.error('Error adding item to guest cart:', error);
    throw error;
  }
};

export const updateGuestCartItem = async (
  sessionId: string,
  itemId: number,
  quantity: number,
  color: string,
  size: Size
): Promise<CartItem> => {
  try {
    const response: AxiosResponse<CartItem> = await api.put(
      `/cart/guest/${sessionId}/items/${itemId}`,
      {
        quantity,
        color,
        size,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating guest cart item:', error);
    throw error;
  }
};

export const removeFromGuestCart = async (
  sessionId: string,
  itemId: number
): Promise<MessageResponse> => {
  try {
    const response: AxiosResponse<MessageResponse> = await api.delete(
      `/cart/guest/${sessionId}/items/${itemId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error removing item from guest cart:`, error);
    throw error;
  }
};

export const clearGuestCart = async (sessionId: string): Promise<MessageResponse> => {
  try {
    const response: AxiosResponse<MessageResponse> = await api.delete(`/cart/guest/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error clearing guest cart:', error);
    throw error;
  }
};

//-----------------------------------//
//         GUEST ORDER ROUTES        //
//-----------------------------------//

export interface GuestOrderCreate {
  items: Array<{
    product_id: number;
    quantity: number;
    color: string;
    size: Size;
    price: number;
  }>;
  guest_email: string;
  guest_name: string;
  guest_phone: string;
  address: AddressBase;
  delivery_note?: string;
}

export const createGuestOrder = async (orderData: GuestOrderCreate): Promise<Order> => {
  try {
    const response = await api.post<Order>('/orders/guest', orderData);
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating guest order:', getAxiosDetail(error) || error);
    throw new Error(getAxiosDetail(error) || 'Unable to create order');
  }
};

export const addToNewsletter = async (email: string) => {
  const response = await api.post('/notifications/newsletter', { email });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const token = localStorage.getItem('access_token'); // Retrieve token from local storage
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await api.get<User>('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error; // Propagate the error to be handled in the calling code
  }
};

export const sendReferrals = async (referrals: Referral[]): Promise<MessageResponse> => {
  try {
    const referralRequest: ReferralRequest = { referrals };
    const response: AxiosResponse<MessageResponse> = await api.post(
      '/notifications/referrals',
      referralRequest
    );
    return response.data;
  } catch (error) {
    console.error('Error sending referrals:', error);
    throw error; // Propagate the error to handle it in the component
  }
};
