import { createGuestCart } from '@/api/account/axios';

const GUEST_SESSION_KEY = 'guest_session_id';

/**
 * Get or create a guest session for anonymous users
 */
export const getOrCreateGuestSession = async (): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access localStorage on server');
  }

  let sessionId = localStorage.getItem(GUEST_SESSION_KEY);

  if (!sessionId) {
    const response = await createGuestCart();
    sessionId = response.session_id;
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }

  return sessionId;
};

/**
 * Get guest session ID if it exists
 */
export const getGuestSession = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_SESSION_KEY);
};

/**
 * Clear guest session (e.g., after checkout or login)
 */
export const clearGuestSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_SESSION_KEY);
};

/**
 * Safe localStorage wrapper with error handling
 */
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`Failed to save ${key} to localStorage`);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

/**
 * Safe sessionStorage wrapper
 */
export const sessionStorage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`Failed to save ${key} to sessionStorage`);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(key);
  },
};
