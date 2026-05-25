'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchSalesRecords } from '@/api/management/axios';
import { SalesRecord } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SalesManagement: React.FC = () => {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchBuyerName, setSearchBuyerName] = useState<string>('');
  const [searchOrderId, setSearchOrderId] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>('');
  const [itemsToShow, setItemsToShow] = useState<number>(15);

  const totalSales = useMemo(
    () => filteredRecords.reduce((total, record) => total + record.price, 0),
    [filteredRecords]
  );

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSalesRecords();
        const sortedData = data.sort(
          (a: SalesRecord, b: SalesRecord) =>
            new Date(b.date_of_sale).getTime() - new Date(a.date_of_sale).getTime()
        );
        setSalesRecords(sortedData);
        setFilteredRecords(sortedData);
      } catch (error) {
        setError('Učitavanje evidencije prodaje nije uspjelo. Pokušajte ponovo.');
        console.error('Error fetching sales records:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const applyFilters = () => {
    let updatedRecords = [...salesRecords];
    if (searchBuyerName.trim()) {
      updatedRecords = updatedRecords.filter((record) =>
        record.buyer_name.toLowerCase().includes(searchBuyerName.toLowerCase().trim())
      );
    }
    if (searchOrderId.trim()) {
      updatedRecords = updatedRecords.filter(
        (record) => record.order_id.toString() === searchOrderId.trim()
      );
    }
    if (searchDate) {
      updatedRecords = updatedRecords.filter(
        (record) =>
          new Date(record.date_of_sale).toLocaleDateString() ===
          new Date(searchDate).toLocaleDateString()
      );
    }
    setFilteredRecords(updatedRecords);
    setItemsToShow(15);
  };

  const visibleRecords = filteredRecords.slice(0, itemsToShow);
  const hasMore = itemsToShow < filteredRecords.length;
  const canLoadLess = itemsToShow > 15;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Evidencija prodaje</h2>
        <p className="text-muted-foreground">
          Pregled svih finalizovanih prodaja, sa filterima i ukupnim prometom.
        </p>
      </div>

      {error && (
        <Card>
          <CardContent className="py-4 text-sm text-destructive">
            Učitavanje evidencije prodaje nije uspjelo. Pokušajte ponovo.
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            Učitavanje evidencije prodaje...
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filteri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="buyerName">Ime kupca</Label>
              <Input
                id="buyerName"
                type="text"
                value={searchBuyerName}
                onChange={(e) => setSearchBuyerName(e.target.value)}
                placeholder="Pretraga po imenu kupca"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderId">ID porudžbine</Label>
              <Input
                id="orderId"
                type="text"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                placeholder="Pretraga po ID porudžbine"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saleDate">Datum prodaje</Label>
              <Input
                id="saleDate"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={applyFilters}>Primijeni filtere</Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchBuyerName('');
                setSearchOrderId('');
                setSearchDate('');
                setFilteredRecords(salesRecords);
                setItemsToShow(15);
              }}
            >
              Resetuj filtere
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Prodaje</CardTitle>
          <div className="text-sm text-muted-foreground">
            Ukupna prodaja:{' '}
            <span className="font-semibold text-foreground">€{totalSales.toFixed(2)}</span>
          </div>
        </CardHeader>
        <CardContent>
          {!isLoading && !error && filteredRecords.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              Nema dostupnih evidencija prodaje.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      {[
                        'ID prodaje',
                        'ID porudžbine',
                        'ID korisnika',
                        'Ime kupca',
                        'Datum prodaje',
                        'Cijena',
                      ].map((header) => (
                        <th key={header} className="px-4 py-3 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRecords.map((record) => (
                      <tr key={record.id} className="border-t hover:bg-muted/30">
                        <td className="px-4 py-3">{record.id}</td>
                        <td className="px-4 py-3">{record.order_id}</td>
                        <td className="px-4 py-3">{record.user_id}</td>
                        <td className="px-4 py-3">{record.buyer_name}</td>
                        <td className="px-4 py-3">
                          {new Date(record.date_of_sale).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium">€{record.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-center gap-3">
                {hasMore ? (
                  <Button variant="outline" onClick={() => setItemsToShow((prev) => prev + 15)}>
                    Učitaj više
                  </Button>
                ) : null}
                {canLoadLess ? (
                  <Button
                    variant="outline"
                    onClick={() => setItemsToShow((prev) => Math.max(15, prev - 15))}
                  >
                    Učitaj manje
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesManagement;
