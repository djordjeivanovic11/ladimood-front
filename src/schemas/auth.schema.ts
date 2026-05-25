import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Unesite ispravnu e-mail adresu'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 znakova'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email('Unesite ispravnu e-mail adresu'),
    password: z.string().min(8, 'Lozinka mora imati najmanje 8 znakova'),
    confirmPassword: z.string(),
    full_name: z.string().min(2, 'Ime mora imati najmanje 2 znaka'),
    phone_number: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Unesite ispravnu e-mail adresu'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token je obavezan'),
    new_password: z.string().min(8, 'Lozinka mora imati najmanje 8 znakova'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Trenutna lozinka je obavezna'),
    new_password: z.string().min(8, 'Lozinka mora imati najmanje 8 znakova'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
