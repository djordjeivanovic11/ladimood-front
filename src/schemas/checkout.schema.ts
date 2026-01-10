import { z } from 'zod';
import { addressSchema } from './address.schema';

export const guestCheckoutSchema = z.object({
  guest_email: z.string().email('Please enter a valid email'),
  guest_name: z.string().min(2, 'Name must be at least 2 characters'),
  guest_phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  delivery_note: z.string().max(200, 'Delivery note is too long').optional(),
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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  inquiry_type: z.string().min(1, 'Please select an inquiry type'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
