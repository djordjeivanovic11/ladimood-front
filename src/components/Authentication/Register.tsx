'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema';
import { useRegister } from '@/hooks/queries/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Register() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: registerUser, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/account');
    }
  }, [isAuthenticated, router]);

  const onSubmit = (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    registerUser({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone_number: data.phone_number?.trim() || '',
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-4xl font-extrabold text-primary">
            Registracija
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Ime i prezime</Label>
              <Input
                id="full_name"
                placeholder="Unesite ime i prezime"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Broj telefona</Label>
              <PhoneNumberInput
                inputProps={{ id: 'phone_number', name: 'phone_number' }}
                onChange={(phone) => setValue('phone_number', phone, { shouldValidate: true })}
                hasError={!!errors.phone_number}
              />
              {errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="Unesite e-mail" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                placeholder="Unesite lozinku"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Potvrdite lozinku"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <p className="text-center text-sm text-destructive">
                {error instanceof Error ? error.message : 'Registracija nije uspjela'}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Registracija u toku...' : 'Registracija'}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground">
            Već imate nalog?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="text-primary hover:underline focus:outline-none"
            >
              Prijava
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
