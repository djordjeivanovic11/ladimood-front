import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCurrentUser, loginUser, registerUser, refreshToken } from '@/api/auth/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from '@/lib/toast';
import type { UserCreate } from '@/app/types/types';

export const authKeys = {
  user: ['auth', 'user'] as const,
};

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.updateUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const user = await fetchCurrentUser();
      setUser(user);
      setLoading(false);
      return user;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const tokens = await loginUser(email, password);
      return tokens;
    },
    onSuccess: async (tokens) => {
      // Fetch user after getting tokens
      const user = await fetchCurrentUser();
      login(tokens, user);
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      toast.success('Welcome back!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (userData: UserCreate) => {
      await registerUser(userData);
      // Auto-login after registration
      const tokens = await loginUser(userData.email, userData.password);
      return tokens;
    },
    onSuccess: async (tokens) => {
      const user = await fetchCurrentUser();
      login(tokens, user);
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      toast.success('Account created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      // Just clear local state, no server call needed for JWT logout
      return Promise.resolve();
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });
}

export function useRefreshToken() {
  const setTokens = useAuthStore((state) => state.setTokens);
  const currentRefreshToken = useAuthStore((state) => state.refreshToken);

  return useMutation({
    mutationFn: async () => {
      if (!currentRefreshToken) throw new Error('No refresh token');
      return refreshToken(currentRefreshToken);
    },
    onSuccess: (tokens) => {
      setTokens(tokens.access_token, tokens.refresh_token);
    },
    onError: () => {
      // If refresh fails, logout
      useAuthStore.getState().logout();
    },
  });
}
