import api from '../axiosInstance';
import type { MessageResponse, User } from '@/app/types/types';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

function getAxiosDetail(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data;
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
  }
  return null;
}

type FetchCurrentUserOptions = {
  /** Avoid global 401 handler during auth callback pages. */
  skipAuthRedirect?: boolean;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

// Fetch current user
export const fetchCurrentUser = async (options?: FetchCurrentUserOptions): Promise<User> => {
  const response = await api.get<User>('/users/me', {
    headers: options?.skipAuthRedirect ? { 'X-Skip-Auth-Redirect': '1' } : undefined,
  });
  return response.data;
};

export async function fetchCurrentUserWithRetry(
  options?: FetchCurrentUserOptions & { attempts?: number }
): Promise<User> {
  const attempts = options?.attempts ?? 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fetchCurrentUser(options);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await delay(400 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

export { isNetworkError, isUnauthorizedError };

export const deleteAccount = async (confirmation: string): Promise<void> => {
  try {
    await api.delete('/users/me', { data: { confirmation } });
  } catch (error: unknown) {
    throw new Error(getAxiosDetail(error) || 'Unable to delete account');
  }
};

export const updateUserPhone = async (phone_number: string): Promise<User> => {
  try {
    const response = await api.patch<User>('/users/me/phone', { phone_number });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getAxiosDetail(error) || 'Unable to update phone number');
  }
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
