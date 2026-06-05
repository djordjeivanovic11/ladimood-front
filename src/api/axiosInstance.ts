import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let handlingUnauthorized = false;

const LOGIN_REDIRECT_SKIP_PREFIXES = [
  '/auth/',
  '/shop',
  '/confirmation',
  '/contact',
  '/creator-challenge',
  '/order',
  '/success',
];

function shouldRedirectToLogin(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  if (path === '/' || path.startsWith('/auth/login')) return false;
  return !LOGIN_REDIRECT_SKIP_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function handleUnauthorized() {
  if (handlingUnauthorized) return;
  handlingUnauthorized = true;
  try {
    await supabase.auth.signOut();
  } finally {
    useAuthStore.getState().logout();
    if (shouldRedirectToLogin()) {
      window.location.assign('/auth/login');
    }
    handlingUnauthorized = false;
  }
}

axiosInstance.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  // Let the browser set multipart boundary (default json Content-Type breaks FormData).
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipAuthRedirect =
      error.config?.headers?.['X-Skip-Auth-Redirect'] === '1' ||
      error.config?.headers?.['x-skip-auth-redirect'] === '1';
    if (axios.isAxiosError(error) && error.response?.status === 401 && !skipAuthRedirect) {
      void handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
