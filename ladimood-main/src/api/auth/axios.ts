import api from '../axiosInstance'; 
import { AxiosResponse } from 'axios';
import { 
  UserCreate, 
  LoginForm, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  ChangePasswordRequest, 
  TokenResponse, 
  MessageResponse 
} from '@/app/types/types';

// Register User
export const registerUser = async (userData: UserCreate): Promise<AxiosResponse<MessageResponse>> => {
  return api.post('/auth/register', userData);
};

// Login User
export const loginUser = async (formData: LoginForm): Promise<AxiosResponse<TokenResponse>> => {
    const params = new URLSearchParams();
    params.append('username', formData.email); // FastAPI's OAuth2PasswordRequestForm uses 'username'
    params.append('password', formData.password);
  
    return api.post('/auth/login', params);
  };
  

// Refresh Token
export const refreshAccessToken = async (refresh_token: string): Promise<AxiosResponse<TokenResponse>> => {
  return api.post('/auth/token/refresh', { refresh_token });
};

// Change Password
export const changePassword = async (
  data: ChangePasswordRequest,
  accessToken: string
): Promise<AxiosResponse<MessageResponse>> => {
  return api.post('/auth/change-password', data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

export const forgotPassword = async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

// Reset Password
export const resetPassword = async (data: ResetPasswordRequest): Promise<AxiosResponse<MessageResponse>> => {
  return api.post('/auth/reset-password', data);
};


// Logout User
export const logoutUser = async (refresh_token: string): Promise<AxiosResponse<MessageResponse>> => {
  return api.post('/auth/logout', { refresh_token });
};