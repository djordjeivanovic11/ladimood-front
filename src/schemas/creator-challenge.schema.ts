import { z } from 'zod';
import { normalizePhoneNumber } from '@/lib/phone';

const instagramHostPattern = /(^|\.)instagram\.com$|(^|\.)instagr\.am$/i;
const tiktokHostPattern = /(^|\.)tiktok\.com$|(^|\.)vm\.tiktok\.com$/i;

export const creatorChallengeFormSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Ime mora imati najmanje 2 znaka').max(120),
    email: z.string().email('Unesite ispravnu e-mail adresu'),
    phone: z
      .string()
      .transform((value) => normalizePhoneNumber(value))
      .refine((value) => value.replace(/\D/g, '').length >= 8, {
        message: 'Broj telefona mora imati najmanje 8 cifara',
      }),
    instagram_handle: z.string().trim().max(80).optional().or(z.literal('')),
    platform: z.enum(['instagram', 'tiktok'], {
      message: 'Odaberite platformu',
    }),
    video_url: z.string().url('Unesite ispravan link do videa'),
    message: z.string().trim().max(2000).optional().or(z.literal('')),
    accepted_rules: z.boolean().refine((value) => value, {
      message: 'Morate prihvatiti pravila igre',
    }),
  })
  .superRefine((data, ctx) => {
    let host = '';
    try {
      host = new URL(data.video_url).hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Unesite ispravan link do videa',
        path: ['video_url'],
      });
      return;
    }

    if (data.platform === 'instagram' && !instagramHostPattern.test(host)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Za Instagram odaberite link sa instagram.com',
        path: ['video_url'],
      });
    }

    if (data.platform === 'tiktok' && !tiktokHostPattern.test(host)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Za TikTok odaberite link sa tiktok.com',
        path: ['video_url'],
      });
    }
  });

export type CreatorChallengeFormData = z.infer<typeof creatorChallengeFormSchema>;

export type CreatorChallengeSubmissionPayload = {
  full_name: string;
  email: string;
  phone: string;
  instagram_handle?: string;
  platform: 'instagram' | 'tiktok';
  video_url: string;
  message?: string;
  accepted_rules: true;
};

export function toCreatorChallengeSubmissionPayload(
  data: CreatorChallengeFormData
): CreatorChallengeSubmissionPayload {
  return {
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    instagram_handle: data.instagram_handle || undefined,
    platform: data.platform,
    video_url: data.video_url,
    message: data.message || undefined,
    accepted_rules: true,
  };
}
