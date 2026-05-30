'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteNewsletterSubscriber,
  fetchAdminUsersOverview,
  fetchNewsletterSubscribers,
  type AdminNewsletterSubscriber,
  type AdminUserOverview,
} from '@/api/management/axios';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPhoneNumber } from '@/lib/phone';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type UserRoleFilter = 'all' | 'ADMIN' | 'USER';
type UserActiveFilter = 'all' | 'active' | 'inactive';

const PAGE_SIZE = 15;

function formatDateTime(value?: string | null): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = React.useState<AdminUserOverview[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = React.useState<
    AdminNewsletterSubscriber[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [deletingSubscriberId, setDeletingSubscriberId] = React.useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [selectedSubscriber, setSelectedSubscriber] =
    React.useState<AdminNewsletterSubscriber | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [registeredSearch, setRegisteredSearch] = React.useState('');
  const [newsletterSearch, setNewsletterSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<UserRoleFilter>('all');
  const [activeFilter, setActiveFilter] = React.useState<UserActiveFilter>('all');
  const [usersToShow, setUsersToShow] = React.useState(PAGE_SIZE);
  const [newsletterToShow, setNewsletterToShow] = React.useState(PAGE_SIZE);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, newsletterData] = await Promise.all([
        fetchAdminUsersOverview(),
        fetchNewsletterSubscribers(),
      ]);
      setUsers(usersData);
      setNewsletterSubscribers(newsletterData);
    } catch (err) {
      console.error(err);
      setError('Učitavanje korisničkog segmenta nije uspjelo.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const normalizedSearch = registeredSearch.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.full_name.toLowerCase().includes(normalizedSearch) ||
        String(user.id).includes(normalizedSearch);

      const matchesRole = roleFilter === 'all' || user.role_name === roleFilter;
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && user.is_active) ||
        (activeFilter === 'inactive' && !user.is_active);

      return matchesSearch && matchesRole && matchesActive;
    });
  }, [users, registeredSearch, roleFilter, activeFilter]);

  const filteredNewsletter = React.useMemo(() => {
    const normalizedSearch = newsletterSearch.trim().toLowerCase();
    if (!normalizedSearch) return newsletterSubscribers;
    return newsletterSubscribers.filter((subscriber) =>
      subscriber.email.toLowerCase().includes(normalizedSearch)
    );
  }, [newsletterSubscribers, newsletterSearch]);

  const visibleUsers = filteredUsers.slice(0, usersToShow);
  const visibleNewsletter = filteredNewsletter.slice(0, newsletterToShow);

  const handleDeleteNewsletter = async () => {
    if (!selectedSubscriber) return;
    setDeletingSubscriberId(selectedSubscriber.id);
    try {
      await deleteNewsletterSubscriber(selectedSubscriber.id);
      setNewsletterSubscribers((prev) => prev.filter((item) => item.id !== selectedSubscriber.id));
      setDeleteModalOpen(false);
      setSelectedSubscriber(null);
      toast.success('Newsletter pretplatnik je uklonjen.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Brisanje nije uspjelo.';
      toast.error(message);
    } finally {
      setDeletingSubscriberId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Korisnici</h2>
          <p className="text-muted-foreground">
            Pregled svih registrovanih korisnika i newsletter pretplatnika.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Osvježi
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="registered" className="w-full">
        <TabsList>
          <TabsTrigger value="registered">Registrovani korisnici</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter pretplatnici</TabsTrigger>
        </TabsList>

        <TabsContent value="registered" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filteri</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="registered-search">Pretraga</Label>
                <Input
                  id="registered-search"
                  value={registeredSearch}
                  onChange={(event) => {
                    setRegisteredSearch(event.target.value);
                    setUsersToShow(PAGE_SIZE);
                  }}
                  placeholder="Ime, email ili ID"
                />
              </div>
              <div className="space-y-2">
                <Label>Uloga</Label>
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value as UserRoleFilter);
                    setUsersToShow(PAGE_SIZE);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sve uloge</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status naloga</Label>
                <Select
                  value={activeFilter}
                  onValueChange={(value) => {
                    setActiveFilter(value as UserActiveFilter);
                    setUsersToShow(PAGE_SIZE);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi statusi</SelectItem>
                    <SelectItem value="active">Aktivan</SelectItem>
                    <SelectItem value="inactive">Neaktivan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Korisnici</CardTitle>
              <Badge variant="secondary">{filteredUsers.length}</Badge>
            </CardHeader>
            <CardContent>
              {visibleUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nema korisnika za prikaz.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {visibleUsers.map((user) => (
                      <button
                        key={user.id}
                        className="w-full rounded-md border p-3 text-left transition hover:bg-muted/40"
                        onClick={() => router.push(`/management/users/${user.id}`)}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{user.full_name || `Korisnik #${user.id}`}</p>
                          <Badge variant={user.role_name === 'ADMIN' ? 'default' : 'secondary'}>
                            {user.role_name || 'N/A'}
                          </Badge>
                          <Badge variant={user.is_active ? 'secondary' : 'outline'}>
                            {user.is_active ? 'Aktivan' : 'Neaktivan'}
                          </Badge>
                          {user.is_newsletter_subscriber ? (
                            <Badge variant="outline">Newsletter</Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.phone_number
                            ? formatPhoneNumber(user.phone_number)
                            : 'Nema telefona'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Kreiran: {formatDateTime(user.created_at)} • Posljednja aktivnost:{' '}
                          {formatDateTime(user.last_active_at)} • Porudžbine: {user.order_count} •
                          Potrošeno: €{user.total_spent.toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center gap-3">
                    {usersToShow < filteredUsers.length ? (
                      <Button
                        variant="outline"
                        onClick={() => setUsersToShow((prev) => prev + PAGE_SIZE)}
                      >
                        Učitaj više
                      </Button>
                    ) : null}
                    {usersToShow > PAGE_SIZE ? (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setUsersToShow((prev) => Math.max(PAGE_SIZE, prev - PAGE_SIZE))
                        }
                      >
                        Učitaj manje
                      </Button>
                    ) : null}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pretraga newsletter liste</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={newsletterSearch}
                onChange={(event) => {
                  setNewsletterSearch(event.target.value);
                  setNewsletterToShow(PAGE_SIZE);
                }}
                placeholder="Pretraga po email adresi"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Newsletter pretplatnici</CardTitle>
              <Badge variant="secondary">{filteredNewsletter.length}</Badge>
            </CardHeader>
            <CardContent>
              {visibleNewsletter.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nema newsletter pretplatnika.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {visibleNewsletter.map((subscriber) => (
                      <div key={subscriber.id} className="rounded-md border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{subscriber.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Pretplata od: {formatDateTime(subscriber.created_at)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {subscriber.has_registered_account ? (
                              <>
                                <Badge variant="secondary">Registrovan korisnik</Badge>
                                {subscriber.user_id ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      router.push(`/management/users/${subscriber.user_id}`)
                                    }
                                  >
                                    Otvori korisnika
                                  </Button>
                                ) : null}
                              </>
                            ) : (
                              <Badge variant="outline">Bez naloga</Badge>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedSubscriber(subscriber);
                                setDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Ukloni
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center gap-3">
                    {newsletterToShow < filteredNewsletter.length ? (
                      <Button
                        variant="outline"
                        onClick={() => setNewsletterToShow((prev) => prev + PAGE_SIZE)}
                      >
                        Učitaj više
                      </Button>
                    ) : null}
                    {newsletterToShow > PAGE_SIZE ? (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setNewsletterToShow((prev) => Math.max(PAGE_SIZE, prev - PAGE_SIZE))
                        }
                      >
                        Učitaj manje
                      </Button>
                    ) : null}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ukloni newsletter pretplatu</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da uklonite {selectedSubscriber?.email} iz newsletter
              liste?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedSubscriber(null);
              }}
            >
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeleteNewsletter()}
              disabled={deletingSubscriberId !== null}
            >
              {deletingSubscriberId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Ukloni
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
