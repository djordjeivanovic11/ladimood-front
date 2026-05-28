'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Mail, Phone, User } from 'lucide-react';
import { logoutUser } from '@/api/auth/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCurrentUser } from '@/hooks/queries/useAuth';
import { AccountSectionHeader } from '@/components/Account/AccountSectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPhoneNumber } from '@/lib/phone';

function UserDetailsSkeleton() {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-4 p-6 pt-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="break-words text-base font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

const UserDetails: React.FC = () => {
  const router = useRouter();
  const cachedUser = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const { data: fetchedUser, isLoading, isFetching, isError, refetch } = useCurrentUser();

  const user = fetchedUser ?? cachedUser;
  const showSkeleton = (isLoading || isFetching) && !user;

  const handleLogout = async () => {
    try {
      await logoutUser();
      logoutStore();
      router.replace('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (showSkeleton) {
    return <UserDetailsSkeleton />;
  }

  if (isError || !user) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="space-y-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">Profil trenutno nije dostupan.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Pokušaj ponovo
            </Button>
            <Button asChild>
              <Link href="/auth/login">Prijava</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-6 p-6">
        <AccountSectionHeader
          icon={User}
          title={`Dobrodošli, ${user.full_name}!`}
          description="Pregled podataka vašeg naloga"
        />
        <div className="space-y-3">
          <DetailRow icon={User} label="Ime" value={user.full_name} />
          <DetailRow icon={Mail} label="E-mail" value={user.email} />
          <DetailRow
            icon={Phone}
            label="Telefon"
            value={formatPhoneNumber(user.phone_number) || 'Nije unijeto'}
          />
        </div>
        <Button type="button" variant="outline" className="w-full gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden />
          Odjava
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
