import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/app/types/types';

interface AuthState {
  user: User | null;
  hasSession: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User | null) => void;
  setAuthSession: (hasSession: boolean) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hasSession: false,
      isAuthenticated: false,
      isLoading: true,

      login: (user) =>
        set({
          user,
          hasSession: true,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          hasSession: false,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateUser: (user) => set({ user, isAuthenticated: get().hasSession && !!user }),
      setAuthSession: (hasSession) =>
        set({
          hasSession,
          user: hasSession ? get().user : null,
          isAuthenticated: hasSession && !!get().user,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      hydrate: () => {
        set({
          hasSession: false,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrate();
        }
      },
    }
  )
);

// Selector hooks for performance optimization
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useUser = () => useAuthStore((state) => state.user);
