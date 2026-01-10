import api from '../axiosInstance';
import type {
  UserCreate,
  ResetPasswordRequest,
  ChangePasswordRequest,
  TokenResponse,
  MessageResponse,
  User,
} from '@/app/types/types';

// Fetch current user
export const fetchCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

// Register User
export const registerUser = async (userData: UserCreate): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/auth/register', userData);
  return response.data;
};

// Login User
export const loginUser = async (email: string, password: string): Promise<TokenResponse> => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  const response = await api.post<TokenResponse>('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  // Store token for subsequent requests
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
  }

  return response.data;
};

// Refresh Token
export const refreshToken = async (refresh_token: string): Promise<TokenResponse> => {
  const response = await api.post<TokenResponse>('/auth/refresh', { refresh_token });
  return response.data;
};

// Change Password
export const changePassword = async (data: ChangePasswordRequest): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/auth/change-password', data);
  return response.data;
};

// Forgot Password
export const forgotPassword = async (email: string): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/auth/forgot-password', { email });
  return response.data;
};

// Reset Password
export const resetPassword = async (data: ResetPasswordRequest): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/auth/reset-password', data);
  return response.data;
};

// Logout User
export const logoutUser = async (): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/auth/logout');
  localStorage.removeItem('access_token');
  return response.data;
};
