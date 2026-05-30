'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchCurrentUser } from '@/api/auth/axios';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type VerificationState = 'checking' | 'verified' | 'pending' | 'error';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function VerifiedPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateUser = useAuthStore((state) => state.updateUser);
  const setAuthSession = useAuthStore((state) => state.setAuthSession);

  const [state, setState] = useState<VerificationState>('checking');
  const [message, setMessage] = useState('Provjeravamo status verifikacije...');

  const nextPath = useMemo(() => {
    const next = searchParams.get('next') || '/confirmation';
    return next.startsWith('/') ? next : '/confirmation';
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        let session = null;
        for (let i = 0; i < 8; i += 1) {
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();
          session = currentSession;
          if (session) break;
          await delay(500);
        }

        if (!session) {
          if (cancelled) return;
          setState('pending');
          setMessage(
            'Link je otvoren, ali sesija još nije aktivna. Prijavite se i nastavite na potvrdu porudžbine.'
          );
          return;
        }

        setAuthSession(true);
        const user = await fetchCurrentUser();
        if (cancelled) return;
        updateUser(user);

        if (user.email_verified) {
          setState('verified');
          setMessage('Vaš e-mail je potvrđen. Možete nastaviti na porudžbinu.');
          return;
        }

        setState('pending');
        setMessage('E-mail još nije potvrđen. Otvorite link iz poruke i pokušajte ponovo.');
      } catch {
        if (cancelled) return;
        setState('error');
        setMessage('Nijesmo uspjeli da provjerimo verifikaciju. Pokušajte ponovo.');
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [setAuthSession, updateUser]);

  useEffect(() => {
    if (state !== 'verified') return;
    const timer = window.setTimeout(() => {
      router.replace(nextPath);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [state, router, nextPath]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-primary">Verifikacija e-maila</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">{message}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={nextPath}>Nastavi na porudžbinu</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">Idi na prijavu</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifiedPage() {
  return (
    <Suspense fallback={null}>
      <VerifiedPageContent />
    </Suspense>
  );
}
