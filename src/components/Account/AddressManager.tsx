'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import { getAddress, setAddress, deleteAddress } from '@/api/account/axios';
import { Address } from '@/app/types/types';
import { AccountSectionHeader } from '@/components/Account/AccountSectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressManagerProps {
  onAddressSaved?: (address: Address) => void;
}

const ADDRESS_FIELDS = [
  { name: 'street_address' as const, label: 'Ulica i broj', placeholder: 'npr. Ulica X' },
  { name: 'city' as const, label: 'Grad', placeholder: 'npr. Podgorica' },
  { name: 'state' as const, label: 'Opština', placeholder: 'npr. Podgorica' },
  { name: 'postal_code' as const, label: 'Poštanski broj', placeholder: 'npr. 81000' },
  { name: 'country' as const, label: 'Država', placeholder: 'npr. Crna Gora' },
];

const AddressManager: React.FC<AddressManagerProps> = ({ onAddressSaved }) => {
  const [address, setAddressState] = useState<Address | null>(null);
  const [form, setForm] = useState({
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  useEffect(() => {
    getAddress()
      .then((data) => {
        setAddressState(data);
        setForm({
          street_address: data.street_address || '',
          city: data.city || '',
          state: data.state || '',
          postal_code: data.postal_code || '',
          country: data.country || '',
        });
      })
      .catch(() => setAddressState(null));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedAddress = await setAddress(form);
      setAddressState(updatedAddress);
      onAddressSaved?.(updatedAddress);
    } catch (error) {
      console.error('Failed to set address', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAddress();
      setAddressState(null);
      setForm({
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
      });
    } catch (error) {
      console.error('Failed to delete address', error);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-6 p-6">
        <AccountSectionHeader
          icon={MapPin}
          title={address ? 'Vaša adresa' : 'Dodajte adresu'}
          description={
            address ? 'Sačuvana adresa za dostavu' : 'Popunite podatke za bržu narudžbinu'
          }
        />

        {address ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-4">
              <p className="text-sm leading-relaxed text-foreground">
                {address.street_address}, {address.city}, {address.state}, {address.postal_code},{' '}
                {address.country}
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Obriši adresu
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {ADDRESS_FIELDS.map(({ name, label, placeholder }) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}
            <Button type="submit" className="w-full">
              Sačuvaj adresu
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressManager;
