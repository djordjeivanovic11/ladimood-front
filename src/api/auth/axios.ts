import api from '../axiosInstance';
import type { MessageResponse, User } from '@/app/types/types';
import { supabase } from '@/lib/supabase';

// Fetch current user
export const fetchCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

// Forgot Password
export const forgotPassword = async (email: string): Promise<MessageResponse> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/change-password`,
  });
  if (error) {
    throw new Error(error.message);
  }
  return {
    message: 'If this email is registered, you will receive instructions to reset your password.',
  };
};

// Reset Password
export const resetPassword = async (newPassword: string): Promise<MessageResponse> => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw new Error(error.message);
  }
  return { message: 'Password reset successfully' };
};

// Logout User
export const logoutUser = async (): Promise<MessageResponse> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
  return { message: 'Logout successful' };
};
