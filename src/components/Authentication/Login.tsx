'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
import { useLogin, useLoginWithGoogle } from '@/hooks/queries/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthDivider, GoogleSignInButton } from '@/components/Authentication/GoogleSignInButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: login, isPending, error } = useLogin();
  const { mutate: loginWithGoogle, isPending: isGooglePending } = useLoginWithGoogle();
  const nextPath = searchParams.get('next') || '/account';
  const safeNextPath = nextPath.startsWith('/') ? nextPath : '/account';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push(safeNextPath);
    }
  }, [isAuthenticated, router, safeNextPath]);

  const onSubmit = (data: LoginFormData) => {
    login(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          router.push(safeNextPath);
        },
      }
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent/30 p-4">
      <div className="w-full max-w-md transform space-y-6 rounded-2xl bg-card p-8 shadow-2xl transition-all duration-500">
        <h1 className="text-center text-4xl font-extrabold text-primary">Prijava</h1>

        <GoogleSignInButton
          label="Prijava putem Google-a"
          loading={isGooglePending}
          disabled={isPending}
          onClick={() => loginWithGoogle({ nextPath: safeNextPath })}
        />

        <AuthDivider />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="Unesite e-mail" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Lozinka</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Unesite lozinku"
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/auth/forgot-password')}
              className="text-sm text-primary hover:underline focus:outline-none"
            >
              Zaboravili ste lozinku?
            </button>
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">
              {error instanceof Error ? error.message : 'Prijava nije uspjela'}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending || isGooglePending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Prijava u toku...
              </span>
            ) : (
              'Prijava'
            )}
          </Button>
        </form>

        <p className="text-center text-muted-foreground">
          Nemate nalog?{' '}
          <button
            onClick={() => router.push(`/auth/register?next=${encodeURIComponent(safeNextPath)}`)}
            className="text-primary hover:underline focus:outline-none"
          >
            Registracija
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
