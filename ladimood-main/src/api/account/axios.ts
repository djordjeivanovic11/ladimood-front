import axios, { AxiosResponse } from 'axios';
import api from '../axiosInstance'; // Use your existing axios instance
import {
  User,
  Address,
  Cart,
  Order,
  OrderCreate,
  WishlistItem,
  MessageResponse,
  CartItem,
  AddressBase,
  Product,
  Referral,
  ReferralRequest,
  Size,
} from '@/app/types/types';
import { encodeOrderId, decodeOrderId } from '@/utils/OrderDecoder';

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
    
    const response: AxiosResponse<Product[]> = await api.get('/account/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Function to get a single product by its ID
export const getProductById = async (productId: number): Promise<Product> => {
  try {
    const response: AxiosResponse<Product> = await api.get(`/account/products/${productId}`);
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
    const response: AxiosResponse<User> = await api.get('/account/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

//-----------------------------------//
//         ADDRESS ROUTES            //
//-----------------------------------//

// Get User Address
export const getAddress = async (): Promise<Address> => {
  try {
    const response: AxiosResponse<Address> = await api.get('/account/address');
    return response.data;
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
};

// Add or Update Address
export const setAddress = async (address: AddressBase): Promise<Address> => {
  try {
    const response: AxiosResponse<Address> = await api.post('/account/address', address);
    return response.data;
  } catch (error) {
    console.error('Error setting address:', error);
    throw error;
  }
};

// Delete Address
export const deleteAddress = async (): Promise<MessageResponse> => {
  try {
    const response: AxiosResponse<MessageResponse> = await api.delete('/account/address');
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
    const response: AxiosResponse<Order[]> = await api.get('/account/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};


// Get Specific Order using hashed order ID (string)
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const response = await api.get<Order>(`/account/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order:', error.response?.data || error.message);
    throw error.response?.data || new Error('Unable to fetch order');
  }
};

// Get Order Details (Order, Items, and Address) using hashed order ID
export const getOrderDetails = async (orderId: string): Promise<Order> => {
  try {
    // Decode hashed order ID before making the request
    const numericOrderId = decodeOrderId(orderId);
    if (numericOrderId === null) {
      throw new Error('Invalid order ID format');
    }
    const response: AxiosResponse<Order> = await api.get(`/account/order/${numericOrderId}/details`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order details for order ID ${orderId}:`, error);
    throw error;
  }
};

// Create an order
export const createOrder = async (order: OrderCreate): Promise<Order> => {
  try {
    const response = await api.post<Order>('/account/orders', order);
    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error.response?.data || new Error('Unable to create order');
  }
};


// Function to cancel an order using hashed order ID
export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    // Decode hashed order ID before making the request
    const numericOrderId = decodeOrderId(orderId);
    if (numericOrderId === null) {
      throw new Error('Invalid order ID format');
    }
    await api.delete(`/account/order/${numericOrderId}`);
  } catch (error: any) {
    console.error('Error canceling order:', error.response?.data || error.message);
    throw error.response?.data || new Error('Unable to cancel order');
  }
};
//-----------------------------------//
//         WISHLIST ROUTES           //
//-----------------------------------//

// Add Item to Wishlist (Frontend Axios Call)
export const addToWishlist = async (wishlistItem: WishlistItem): Promise<WishlistItem> => {
  try {
    // Send color and size with the wishlist item
    const response: AxiosResponse<WishlistItem> = await api.post('/account/wishlist', wishlistItem);
    return response.data;
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    throw error;
  }
};

// Get Wishlist (Frontend Axios Call)
export const getWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const response: AxiosResponse<WishlistItem[]> = await api.get('/account/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

// Remove Item from Wishlist
export const removeFromWishlist = async (itemId: number): Promise<MessageResponse> => {
  try {
    const response: AxiosResponse<MessageResponse> = await api.delete(`/account/wishlist/${itemId}`);
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
    const response: AxiosResponse<Cart> = await api.get('/account/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Add Item to Cart
export const addToCart = async (cartItem: CartItem): Promise<CartItem> => {
  try {
    const response: AxiosResponse<CartItem> = await api.post('/account/cart', cartItem);
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
    const response: AxiosResponse<CartItem> = await api.put(`/account/cart/${cartItem.id}`, cartItem);
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove Item from Cart
export const removeFromCart = async (itemId: number, color: string, size: Size): Promise<MessageResponse> => {
  try {
    const response: AxiosResponse<MessageResponse> = await api.delete(`/account/cart/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing item from cart with ID ${itemId}:`, error);
    throw error;
  }
};


export const clearCart = async (): Promise<MessageResponse> => {
  try {
    // Ensure you're passing the correct headers including authorization (if necessary)
    const response: AxiosResponse<MessageResponse> = await api.delete('account/cart/clear', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`, // Assuming Bearer token auth
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};


export const addToNewsletter = async (email: any) => {
  try {
    await axios.post('/api/account/add-to-newsletter', { email });
    alert('Successfully subscribed to the newsletter!');
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      alert('This email is already registered.');
    } else {
      console.error('Error subscribing to the newsletter', error);
    }
  }
};



export const getCurrentUser = async (): Promise<User> => {
  try {
    const token = localStorage.getItem('access_token'); // Retrieve token from local storage
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await api.get<User>('/account/details', {
      headers: {
        'Authorization': `Bearer ${token}`,  // Include the token in the Authorization header
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;  // Propagate the error to be handled in the calling code
  }
};


export const sendReferrals = async (referrals: Referral[]): Promise<MessageResponse> => {
  try {
    const referralRequest: ReferralRequest = { referrals };
    const response: AxiosResponse<MessageResponse> = await api.post('/account/referrals', referralRequest);
    return response.data;
  } catch (error) {
    console.error('Error sending referrals:', error);
    throw error; // Propagate the error to handle it in the component
  }
};