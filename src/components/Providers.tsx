'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { getQueryClient } from '@/lib/query-client';
import { getOrCreateGuestSession } from '@/lib/storage';
import { fetchCurrentUser } from '@/api/auth/axios';
import { supabase } from '@/lib/supabase';
import { useCartSync } from '@/hooks/useCartSync';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';

interface ProvidersProps {
  children: React.ReactNode;
}

function isAuthCallbackPath(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  return path.startsWith('/auth/verified') || path.startsWith('/auth/change-password');
}

function CartBootstrap() {
  useCartSync();
  const authLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setGuestSession = useCartStore((state) => state.setGuestSession);

  useEffect(() => {
    if (authLoading || isAuthenticated) return;
    void getOrCreateGuestSession()
      .then(setGuestSession)
      .catch(() => {});
  }, [authLoading, isAuthenticated, setGuestSession]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    let mounted = true;

    const syncSession = async (session: { access_token: string } | null) => {
      if (!mounted) return;

      if (!session) {
        logout();
        if (mounted) setLoading(false);
        return;
      }

      setAuthSession(true);
      try {
        const user = await fetchCurrentUser();
        if (mounted) {
          updateUser(user);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401 && !isAuthCallbackPath()) {
          await supabase.auth.signOut();
        }
        if (mounted) logout();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const bootstrap = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await syncSession(session);
      } catch {
        if (mounted) {
          logout();
          setLoading(false);
        }
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        logout();
        setLoading(false);
        return;
      }

      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        void syncSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [logout, setAuthSession, setLoading, updateUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <CartBootstrap />
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
