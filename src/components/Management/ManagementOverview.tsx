'use client';

import React from 'react';
import {
  fetchAdminUsersOverview,
  fetchDashboardSummary,
  type AdminUserOverview,
  type DashboardSummary,
} from '@/api/management/axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPhoneNumber } from '@/lib/phone';

const statusOrder = ['CREATED', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

const statusLabels: Record<(typeof statusOrder)[number], string> = {
  CREATED: 'Kreirano',
  PENDING: 'Na čekanju',
  SHIPPED: 'Poslato',
  DELIVERED: 'Dostavljeno',
  CANCELLED: 'Otkazano',
};

function formatAddress(address?: AdminUserOverview['address']) {
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

export default function ManagementOverview() {
  const [users, setUsers] = React.useState<AdminUserOverview[]>([]);
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, summaryData] = await Promise.all([
        fetchAdminUsersOverview(),
        fetchDashboardSummary(),
      ]);
      setUsers(usersData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
      setError('Učitavanje pregleda nije uspjelo.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Pregled upravljanja</h2>
          <p className="text-muted-foreground">
            Pregled korisnika, adresa, porudžbina, prodaje i stope završetka na nivou baze.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
          Osvježi
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Ukupno porudžbina</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{summary?.orders_count ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Jedinstveni korisnici</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{summary?.users_count ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Porudžbine sa adresom</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {summary?.addresses_count ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ukupna prodaja</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            €{(summary?.total_sales_amount ?? 0).toFixed(2)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Korisnici, lični podaci i posljednja adresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema dostupnih korisnika.</p>
            ) : (
              users.slice(0, 20).map((user) => (
                <div key={user.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium">{user.full_name || `Korisnik #${user.id}`}</p>
                    <Badge variant="secondary">{user.order_count} porudžbina</Badge>
                  </div>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-muted-foreground">
                    {user.phone_number ? formatPhoneNumber(user.phone_number) : 'Nema telefona'}
                  </p>
                  <p className="mt-1">{formatAddress(user.address)}</p>
                  <p className="text-xs text-muted-foreground">
                    Uloga: {user.role_name || 'N/A'} • Ukupno potrošeno: €
                    {user.total_spent.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Završetak porudžbina i statusi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">Stopa završetka</p>
              <p className="text-3xl font-semibold">
                {(summary?.completion_rate ?? 0).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {summary?.delivered_orders_count ?? 0} dostavljeno od ukupno{' '}
                {summary?.orders_count ?? 0} porudžbina
              </p>
            </div>

            <div className="space-y-2">
              {statusOrder.map((status) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span className="text-sm font-medium">{statusLabels[status]}</span>
                  <Badge>{summary?.status_counts?.[status] ?? 0}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
