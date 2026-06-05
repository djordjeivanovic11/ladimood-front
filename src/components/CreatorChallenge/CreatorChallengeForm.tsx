'use client';

import React, { useState } from 'react';
import { submitCreatorChallenge } from '@/api/notifications';
import {
  creatorChallengeFormSchema,
  toCreatorChallengeSubmissionPayload,
} from '@/schemas/creator-challenge.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const INSTAGRAM_URL = 'https://instagram.com/ladimood.store';

const GAME_RULES = [
  'Snimi Reel ili TikTok u Ladimood majici.',
  'Taguj @ladimood.store.',
  'Profil i objava moraju biti javni.',
  'Pošalji nam link do videa.',
  'Ako video pređe 2.000 pregleda u 7 dana, dobijaš Ladimood majicu.',
  'Ako pređe 10.000 pregleda, dobijaš tri majice.',
  'Video mora biti originalan, normalan i stvarno vezan za Ladimood.',
  'Ladimood zadržava pravo da odobri nagrade i repostuje najbolje objave.',
];

const initialFormState = {
  full_name: '',
  email: '',
  phone: '',
  instagram_handle: '',
  platform: '' as '' | 'instagram' | 'tiktok',
  video_url: '',
  message: '',
  accepted_rules: false,
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string | { msg?: string }[] } } })
      .response;
    const detail = response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function CreatorChallengeForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const nextValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      platform: formData.platform || undefined,
      accepted_rules: formData.accepted_rules ? (true as const) : undefined,
      instagram_handle: formData.instagram_handle || undefined,
      message: formData.message || undefined,
    };

    const parsed = creatorChallengeFormSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitCreatorChallenge(
        toCreatorChallengeSubmissionPayload(parsed.data)
      );
      toast.success(response.message);
      setFormData(initialFormState);
      setFieldErrors({});
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Došlo je do greške. Pokušajte ponovo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card id="prijava" className="mx-auto max-w-2xl scroll-mt-28 border-border/60 shadow-lg">
        <CardContent className="p-6 md:p-10">
          <Badge variant="outline" className="mb-4 uppercase tracking-widest">
            Ladimood igra
          </Badge>
          <h2 className="text-3xl font-extrabold text-primary md:text-4xl">Prijavi svoj reel</h2>
          <p className="mt-4 text-muted-foreground">
            Popuni formu ispod i pošalji nam link do svog videa. Taguj{' '}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              @ladimood.store
            </a>{' '}
            na objavi prije slanja.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Ime i prezime</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.full_name ? (
                  <p className="text-sm text-destructive">{fieldErrors.full_name}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.email ? (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <PhoneNumberInput
                  inputProps={{ id: 'phone', name: 'phone', required: true }}
                  value={formData.phone}
                  onChange={(phone) => {
                    setFormData((prev) => ({ ...prev, phone }));
                    setFieldErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  hasError={!!fieldErrors.phone}
                />
                {fieldErrors.phone ? (
                  <p className="text-sm text-destructive">{fieldErrors.phone}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_handle">Instagram profil (opciono)</Label>
                <Input
                  id="instagram_handle"
                  name="instagram_handle"
                  placeholder="@username"
                  value={formData.instagram_handle}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform">Platforma</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: 'instagram' | 'tiktok') =>
                    setFormData((prev) => ({ ...prev, platform: value }))
                  }
                >
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Odaberite platformu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.platform ? (
                  <p className="text-sm text-destructive">{fieldErrors.platform}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">Link do videa</Label>
                <Input
                  id="video_url"
                  name="video_url"
                  type="url"
                  placeholder="https://instagram.com/reel/..."
                  value={formData.video_url}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.video_url ? (
                  <p className="text-sm text-destructive">{fieldErrors.video_url}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Poruka (opciono)</Label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  name="accepted_rules"
                  checked={formData.accepted_rules}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-input"
                />
                <span>
                  Slažem se sa{' '}
                  <button
                    type="button"
                    onClick={() => setRulesOpen(true)}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    pravilima igre
                  </button>
                  .
                </span>
              </label>
              {fieldErrors.accepted_rules ? (
                <p className="text-sm text-destructive">{fieldErrors.accepted_rules}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Slanje...' : 'Pošalji prijavu'}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">Instagram nije organizator ove igre.</p>
        </CardContent>
      </Card>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pravila igre</DialogTitle>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
            {GAME_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreatorChallengeForm;
