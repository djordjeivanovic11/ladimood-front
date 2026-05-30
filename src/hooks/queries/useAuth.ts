import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteAccount, fetchCurrentUser, updateUserPhone } from '@/api/auth/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from '@/lib/toast';
import { normalizePhoneNumber } from '@/lib/phone';
import type { User, UserCreate } from '@/app/types/types';
import { supabase } from '@/lib/supabase';

export const authKeys = {
  user: ['auth', 'user'] as const,
};

export function useCurrentUser() {
  const authLoading = useAuthStore((state) => state.isLoading);
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const setUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setAuthSession(false);
        setUser(null);
        return null;
      }

      setAuthSession(true);

      try {
        const user = await fetchCurrentUser();
        setUser(user);
        return user;
      } catch (error) {
        await supabase.auth.signOut();
        logout();
        throw error;
      }
    },
    enabled: !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.session) throw new Error('Prijava nije uspjela: nema aktivne sesije');
      return true;
    },
    onSuccess: async () => {
      // Fetch user after getting tokens
      const user = await fetchCurrentUser();
      login(user);
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      toast.success('Dobrodošli nazad!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Prijava nije uspjela');
    },
  });
}

export function useLoginWithGoogle() {
  return useMutation({
    mutationFn: async ({ nextPath }: { nextPath?: string }) => {
      const safeNext = nextPath?.startsWith('/') ? nextPath : '/confirmation';
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/verified?next=${encodeURIComponent(safeNext)}&auth_source=oauth`
          : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw new Error(error.message);
      return true;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Google prijava nije uspjela');
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (userData: UserCreate) => {
      const emailRedirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/verified?next=/confirmation&auth_source=email_signup`
          : undefined;
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo,
          data: {
            full_name: userData.full_name,
            phone_number: normalizePhoneNumber(userData.phone_number),
          },
        },
      });
      if (error) throw new Error(error.message);
      return data.session;
    },
    onSuccess: async (session) => {
      if (!session) {
        toast.success('Nalog je kreiran. Potvrdite e-mail, zatim se prijavite.');
        return;
      }
      const user = await fetchCurrentUser();
      login(user);
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      toast.success('Nalog je uspješno kreiran!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registracija nije uspjela');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Uspješno ste se odjavili');
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async (confirmation: string) => {
      await deleteAccount(confirmation);
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Vaš nalog je obrisan.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Brisanje naloga nije uspjelo');
    },
  });
}

export function useUpdateUserPhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phone_number: string) => updateUserPhone(phone_number),
    onSuccess: (user: User) => {
      queryClient.setQueryData(authKeys.user, user);
      toast.success('Broj telefona je sačuvan.');
      return user;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Čuvanje broja telefona nije uspjelo');
    },
  });
}
