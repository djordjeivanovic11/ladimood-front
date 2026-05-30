'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axiosInstance from '@/api/axiosInstance';
import {
  deleteAdminUser,
  deleteNewsletterSubscriber,
  fetchAdminUserDetail,
  fetchNewsletterSubscribers,
  updateAdminUser,
  type AdminUserDetail,
} from '@/api/management/axios';
import type { User } from '@/app/types/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPhoneNumber } from '@/lib/phone';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type ConfirmActionType = 'toggle-active' | 'toggle-role' | 'remove-newsletter' | 'permanent-delete';

interface ConfirmActionState {
  type: ConfirmActionType;
  title: string;
  description: string;
  confirmLabel: string;
}

function formatAddress(address?: AdminUserDetail['address']): string {
  if (!address) return 'Nema adrese';
  const parts = [
    address.street_address,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
}

function formatDate(value?: string | null): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function ManagementUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.userId);

  const [user, setUser] = React.useState<AdminUserDetail | null>(null);
  const [newsletterSubscriberId, setNewsletterSubscriberId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<ConfirmActionState | null>(null);

  const refresh = React.useCallback(async () => {
    if (!Number.isFinite(userId) || userId <= 0) {
      setError('Neispravan ID korisnika.');
      setLoading(false);
      return;
    }

    try {
      const me = await axiosInstance.get<User>('/users/me');
      if (me.data?.role?.name !== 'ADMIN') {
        router.replace('/account');
        return;
      }
      const [userData, newsletterData] = await Promise.all([
        fetchAdminUserDetail(userId),
        fetchNewsletterSubscribers(),
      ]);
      setUser(userData);
      const subscriber = newsletterData.find(
        (item) => item.email.trim().toLowerCase() === userData.email.trim().toLowerCase()
      );
      setNewsletterSubscriberId(subscriber?.id ?? null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Učitavanje korisnika nije uspjelo.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router, userId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = async () => {
    if (!user || !confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === 'toggle-active') {
        await updateAdminUser(user.id, { is_active: !user.is_active });
      } else if (confirmAction.type === 'toggle-role') {
        await updateAdminUser(user.id, {
          role_name: user.role_name === 'ADMIN' ? 'USER' : 'ADMIN',
        });
      } else if (confirmAction.type === 'remove-newsletter') {
        if (!newsletterSubscriberId) {
          throw new Error('Newsletter pretplata nije pronađena.');
        }
        await deleteNewsletterSubscriber(newsletterSubscriberId);
      } else if (confirmAction.type === 'permanent-delete') {
        await deleteAdminUser(user.id);
        toast.success('Korisnik je trajno obrisan.');
        router.replace('/management?section=users');
        return;
      }

      await refresh();
      toast.success('Promjena je uspješno sačuvana.');
      setConfirmAction(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Akcija nije uspjela.';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (!user || error) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <Button variant="ghost" asChild>
            <Link href="/management?section=users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nazad na korisnike
            </Link>
          </Button>
          <Card>
            <CardContent className="py-6 text-sm text-destructive">
              {error ?? 'Korisnik nije pronađen.'}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/management?section=users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad na korisnike
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Profil korisnika</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{user.full_name || `Korisnik #${user.id}`}</h1>
              <Badge variant={user.role_name === 'ADMIN' ? 'default' : 'secondary'}>
                {user.role_name || 'N/A'}
              </Badge>
              <Badge variant={user.is_active ? 'secondary' : 'outline'}>
                {user.is_active ? 'Aktivan' : 'Neaktivan'}
              </Badge>
              {user.is_newsletter_subscriber ? (
                <Badge variant="outline">Newsletter pretplatnik</Badge>
              ) : (
                <Badge variant="outline">Bez newsletter pretplate</Badge>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Email:</span> {user.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Telefon:</span>{' '}
                  {user.phone_number ? formatPhoneNumber(user.phone_number) : 'Nema telefona'}
                </p>
                <p>
                  <span className="text-muted-foreground">Email verifikovan:</span>{' '}
                  {user.email_verified ? 'Da' : 'Ne'}
                </p>
                <p>
                  <span className="text-muted-foreground">Kreiran:</span>{' '}
                  {formatDate(user.created_at)}
                </p>
                <p>
                  <span className="text-muted-foreground">Posljednja aktivnost:</span>{' '}
                  {formatDate(user.last_active_at)}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Adresa:</span>{' '}
                  {formatAddress(user.address)}
                </p>
                <p>
                  <span className="text-muted-foreground">Ukupno porudžbina:</span>{' '}
                  {user.order_count}
                </p>
                <p>
                  <span className="text-muted-foreground">Ukupno potrošeno:</span> €
                  {user.total_spent.toFixed(2)}
                </p>
                <p>
                  <span className="text-muted-foreground">Posljednja porudžbina:</span>{' '}
                  {formatDate(user.last_order_at)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={user.is_active ? 'destructive' : 'default'}
                onClick={() =>
                  setConfirmAction({
                    type: 'toggle-active',
                    title: user.is_active ? 'Deaktivacija korisnika' : 'Reaktivacija korisnika',
                    description: user.is_active
                      ? 'Nalog će biti deaktiviran i korisnik više neće moći da pristupa platformi.'
                      : 'Nalog će ponovo biti aktivan.',
                    confirmLabel: user.is_active ? 'Deaktiviraj' : 'Reaktiviraj',
                  })
                }
              >
                {user.is_active ? 'Deaktiviraj korisnika' : 'Reaktiviraj korisnika'}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmAction({
                    type: 'toggle-role',
                    title:
                      user.role_name === 'ADMIN' ? 'Uklanjanje ADMIN uloge' : 'Dodjela ADMIN uloge',
                    description:
                      user.role_name === 'ADMIN'
                        ? 'Korisnik će izgubiti ADMIN pristup.'
                        : 'Korisnik će dobiti ADMIN ulogu ako prolazi allowlist pravilo.',
                    confirmLabel:
                      user.role_name === 'ADMIN' ? 'Demotuj u USER' : 'Promoviši u ADMIN',
                  })
                }
              >
                {user.role_name === 'ADMIN' ? 'Demotuj u USER' : 'Promoviši u ADMIN'}
              </Button>
              {user.is_newsletter_subscriber ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    setConfirmAction({
                      type: 'remove-newsletter',
                      title: 'Uklanjanje newsletter pretplate',
                      description: 'Email će biti uklonjen iz newsletter liste.',
                      confirmLabel: 'Ukloni iz newslettera',
                    })
                  }
                >
                  Ukloni iz newslettera
                </Button>
              ) : null}
              <Button
                variant="destructive"
                onClick={() =>
                  setConfirmAction({
                    type: 'permanent-delete',
                    title: 'Trajno brisanje korisnika',
                    description:
                      'Ova akcija trajno briše korisnika i povezane zapise. Koristite samo kada ste sigurni.',
                    confirmLabel: 'Trajno obriši',
                  })
                }
              >
                Trajno obriši korisnika
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Istorija porudžbina</CardTitle>
          </CardHeader>
          <CardContent>
            {user.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Korisnik nema porudžbine.</p>
            ) : (
              <div className="space-y-2">
                {user.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/management/orders/${order.id}`}
                    className="block rounded-md border p-3 transition hover:bg-muted/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">Porudžbina #{order.order_number}</p>
                      <Badge>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)} • €{order.total_price.toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => (!open ? setConfirmAction(null) : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
            <DialogDescription>{confirmAction?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={actionLoading}
            >
              Otkaži
            </Button>
            <Button onClick={() => void runAction()} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {confirmAction?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
