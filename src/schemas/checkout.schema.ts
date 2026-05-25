import { z } from 'zod';
import { addressSchema } from './address.schema';

export const guestCheckoutSchema = z.object({
  guest_email: z.string().email('Unesite ispravnu e-mail adresu'),
  guest_name: z.string().min(2, 'Ime mora imati najmanje 2 znaka'),
  guest_phone: z.string().min(8, 'Broj telefona mora imati najmanje 8 znakova'),
  delivery_note: z.string().max(200, 'Napomena za dostavu je predugačka').optional(),
  address: addressSchema,
});

export type GuestCheckoutFormData = z.infer<typeof guestCheckoutSchema>;

export const authenticatedCheckoutSchema = z.object({
  useExistingAddress: z.boolean().default(true),
  address: addressSchema.optional(),
});

export type AuthenticatedCheckoutFormData = z.infer<typeof authenticatedCheckoutSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Ime mora imati najmanje 2 znaka'),
  email: z.string().email('Unesite ispravnu e-mail adresu'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Poruka mora imati najmanje 10 znakova'),
  inquiry_type: z.string().min(1, 'Odaberite vrstu upita'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
