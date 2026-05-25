import { z } from 'zod';

export const addressSchema = z.object({
  street_address: z.string().min(5, 'Ulica i broj moraju imati najmanje 5 znakova'),
  city: z.string().min(2, 'Grad mora imati najmanje 2 znaka'),
  state: z.string().optional(),
  postal_code: z.string().min(4, 'Poštanski broj mora imati najmanje 4 znaka'),
  country: z.string().min(2, 'Država mora imati najmanje 2 znaka'),
});

export type AddressFormData = z.infer<typeof addressSchema>;
