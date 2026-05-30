'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '@/api/axiosInstance';
import OrderManagement from '@/components/Management/OrderManagement';
import SalesManagement from '@/components/Management/SalesManagement';
import CatalogManagement from '@/components/Management/CatalogManagement';
import ManagementOverview from '@/components/Management/ManagementOverview';
import CatalogTaxonomyManagement from '@/components/Management/CatalogTaxonomyManagement';
import UserManagement from '@/components/Management/UserManagement';
import { User } from '@/app/types/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

type ManagementSection = 'overview' | 'operations' | 'catalog' | 'users';
type CatalogTab = 'products' | 'taxonomy';

export default function ManagementPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeSection, setActiveSection] = useState<ManagementSection>('overview');
  const [catalogTab, setCatalogTab] = useState<CatalogTab>('products');
  const [focusedProductId, setFocusedProductId] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let mounted = true;

    const verifyAdminAccess = async () => {
      try {
        const res = await axiosInstance.get<User>('/users/me');
        if (!mounted) return;
        if (res.data?.role?.name !== 'ADMIN') {
          router.replace('/account');
          return;
        }
        setIsAuthorized(true);
      } catch {
        if (!mounted) return;
        router.replace('/auth/login?next=/management');
      }
    };

    void verifyAdminAccess();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    const section = searchParams.get('section');
    if (
      section === 'overview' ||
      section === 'operations' ||
      section === 'catalog' ||
      section === 'users'
    ) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const setSection = (nextSection: ManagementSection) => {
    setActiveSection(nextSection);
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', nextSection);
    router.replace(`/management?${params.toString()}`);
  };

  if (!isAuthorized) {
    return <div>Učitavanje...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-[#0097B2]">MENADŽMENT</h1>
        <p className="mt-2 text-muted-foreground">
          Centralizovana kontrola baze, porudžbina, prodaje i kompletnog upravljanja katalogom.
        </p>
      </header>
      <main className="mx-auto grid max-w-screen-2xl gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardContent className="p-3">
            <div className="space-y-2">
              <button
                className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeSection === 'overview'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSection('overview')}
              >
                Pregled table
              </button>
              <button
                className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeSection === 'operations'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSection('operations')}
              >
                Porudžbine i prodaja
              </button>
              <button
                className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeSection === 'catalog'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSection('catalog')}
              >
                Upravljanje katalogom
              </button>
              <button
                className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeSection === 'users'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSection('users')}
              >
                Korisnici
              </button>
            </div>
          </CardContent>
        </Card>

        <div>
          {activeSection === 'overview' ? (
            <ManagementOverview onOpenUsers={() => setSection('users')} />
          ) : null}

          {activeSection === 'operations' ? (
            <Tabs defaultValue="orders" className="w-full">
              <TabsList>
                <TabsTrigger value="orders">Porudžbine</TabsTrigger>
                <TabsTrigger value="sales">Prodaja</TabsTrigger>
              </TabsList>
              <TabsContent value="orders" className="mt-4">
                <OrderManagement />
              </TabsContent>
              <TabsContent value="sales" className="mt-4">
                <SalesManagement />
              </TabsContent>
            </Tabs>
          ) : null}

          {activeSection === 'catalog' ? (
            <Tabs
              value={catalogTab}
              onValueChange={(value) => setCatalogTab(value as CatalogTab)}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="products">Proizvodi</TabsTrigger>
                <TabsTrigger value="taxonomy">Kategorije i kolekcije</TabsTrigger>
              </TabsList>
              <TabsContent value="products" className="mt-4">
                <CatalogManagement
                  onOpenTaxonomy={() => setCatalogTab('taxonomy')}
                  focusedProductId={focusedProductId}
                  onFocusedProductHandled={() => setFocusedProductId(null)}
                />
              </TabsContent>
              <TabsContent value="taxonomy" className="mt-4">
                <CatalogTaxonomyManagement
                  onOpenProduct={(productId) => {
                    setFocusedProductId(productId);
                    setCatalogTab('products');
                  }}
                />
              </TabsContent>
            </Tabs>
          ) : null}

          {activeSection === 'users' ? <UserManagement /> : null}
        </div>
      </main>
    </div>
  );
}
