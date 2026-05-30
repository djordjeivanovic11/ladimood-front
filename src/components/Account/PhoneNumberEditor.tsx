'use client';

import { useEffect, useState } from 'react';
import { Pencil, Phone } from 'lucide-react';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUpdateUserPhone } from '@/hooks/queries/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatPhoneNumber, normalizePhoneNumber } from '@/lib/phone';
import { cn } from '@/lib/utils';

interface PhoneNumberEditorProps {
  className?: string;
  onSaved?: () => void;
}

export function PhoneNumberEditor({ className, onSaved }: PhoneNumberEditorProps) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { mutate: savePhone, isPending } = useUpdateUserPhone();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const savedPhone = normalizePhoneNumber(user?.phone_number);
  const hasSavedPhone = savedPhone.length >= 9;
  const phoneInputValue = phone.replace(/^\+/, '');
  const showEditor = !hasSavedPhone || isEditing;

  useEffect(() => {
    setPhone(savedPhone);
  }, [savedPhone]);

  const handleCancel = () => {
    setPhone(savedPhone);
    setError(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    const normalized = normalizePhoneNumber(phone);
    if (normalized.length < 9) {
      setError('Unesite ispravan broj telefona.');
      return;
    }

    setError(null);
    savePhone(normalized, {
      onSuccess: (updatedUser) => {
        updateUser(updatedUser);
        setIsEditing(false);
        onSaved?.();
      },
      onError: (saveError) => {
        setError(saveError instanceof Error ? saveError.message : 'Čuvanje nije uspjelo.');
      },
    });
  };

  if (!showEditor) {
    return (
      <div
        className={cn(
          'flex gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3',
          className
        )}
      >
        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Telefon
            </p>
            <p className="break-words text-base font-medium text-foreground">
              {formatPhoneNumber(user?.phone_number)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-0.5 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label="Uredi broj telefona"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3',
        className
      )}
    >
      <div className="flex gap-3">
        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <Label
              htmlFor="account-phone"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Telefon{' '}
              {!hasSavedPhone ? <span className="normal-case text-foreground">*</span> : null}
            </Label>
            {!hasSavedPhone ? (
              <p className="mt-1 text-sm text-amber-800">
                Obavezno za porudžbinu. Unesite broj telefona prije završetka kupovine.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <PhoneNumberInput
              value={phoneInputValue}
              inputProps={{ id: 'account-phone', name: 'phone_number' }}
              onChange={(nextPhone) => {
                setPhone(nextPhone);
                if (error) setError(null);
              }}
              hasError={!!error}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={handleSave}
              >
                {isPending ? 'Čuvanje...' : hasSavedPhone ? 'Sačuvaj' : 'Sačuvaj telefon'}
              </Button>
              {hasSavedPhone ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={handleCancel}
                >
                  Odustani
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
