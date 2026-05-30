'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteAccount } from '@/hooks/queries/useAuth';

export const ACCOUNT_DELETE_CONFIRMATION = 'OBRIŠI';

export function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const { mutate: deleteAccount, isPending } = useDeleteAccount();

  const canConfirm = confirmation.trim().toUpperCase() === ACCOUNT_DELETE_CONFIRMATION;

  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
    setConfirmation('');
  };

  const handleDelete = () => {
    if (!canConfirm) return;

    deleteAccount(confirmation.trim(), {
      onSuccess: () => {
        setOpen(false);
        setConfirmation('');
        router.replace('/');
      },
    });
  };

  return (
    <>
      <div className="text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Obriši moj profil
        </button>
      </div>

      <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : handleClose())}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Obriši nalog</DialogTitle>
            <DialogDescription>
              Ova radnja je trajna. Uklonićemo vaše podatke profila, adresu, korpu i listu želja.
              Porudžbine ostaju u sistemu sa anonimizovanim ličnim podacima.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">
              Upišite{' '}
              <span className="font-medium text-foreground">{ACCOUNT_DELETE_CONFIRMATION}</span> za
              potvrdu
            </Label>
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={ACCOUNT_DELETE_CONFIRMATION}
              autoComplete="off"
              disabled={isPending}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Odustani
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canConfirm || isPending}
              onClick={handleDelete}
            >
              {isPending ? 'Brisanje...' : 'Trajno obriši nalog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
