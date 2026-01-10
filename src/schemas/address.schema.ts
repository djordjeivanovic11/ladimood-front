import { z } from 'zod';

export const addressSchema = z.object({
  street_address: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().optional(),
  postal_code: z.string().min(4, 'Postal code must be at least 4 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
});

export type AddressFormData = z.infer<typeof addressSchema>;
