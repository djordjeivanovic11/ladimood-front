'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { fetchCurrentUser } from '@/api/auth/axios';
import { completeAuthCallback, isSupabaseEmailConfirmed } from '@/lib/supabase-auth-callback';
import { isPkceVerifierMissingError } from '@/lib/supabase-auth-errors';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type VerificationState = 'checking' | 'verified' | 'pending' | 'error';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data;
    if (detail && typeof detail === 'object' && 'detail' in detail) {
      const message = (detail as { detail?: unknown }).detail;
      if (typeof message === 'string' && message.trim()) return message;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Nijesmo uspjeli da provjerimo verifikaciju. Pokušajte ponovo.';
}

function VerifiedPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateUser = useAuthStore((state) => state.updateUser);
  const setAuthSession = useAuthStore((state) => state.setAuthSession);

  const [state, setState] = useState<VerificationState>('checking');
  const [message, setMessage] = useState('Provjeravamo status verifikacije...');
  const authSource = searchParams.get('auth_source');
  const isOAuthFlow = authSource === 'oauth';

  const nextPath = useMemo(() => {
    const next = searchParams.get('next') || '/confirmation';
    return next.startsWith('/') ? next : '/confirmation';
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const { session, error: callbackError } = await completeAuthCallback();
        if (callbackError) throw callbackError;

        if (!session) {
          if (cancelled) return;
          if (isOAuthFlow) {
            setState('error');
            setMessage(
              'Google prijava nije završena. Pokušajte ponovo kroz dugme "Google prijava".'
            );
          } else {
            setState('pending');
            setMessage(
              'Link je otvoren, ali sesija još nije aktivna. Prijavite se i nastavite na potvrdu porudžbine.'
            );
          }
          return;
        }

        setAuthSession(true);

        let user = null;
        try {
          user = await fetchCurrentUser({ skipAuthRedirect: true });
          if (cancelled) return;
          updateUser(user);
        } catch (backendError) {
          if (cancelled) return;
          const supabaseConfirmed = await isSupabaseEmailConfirmed();
          if (isOAuthFlow || supabaseConfirmed) {
            setState('verified');
            setMessage(
              isOAuthFlow
                ? 'Google prijava je uspješna. Nastavljamo dalje.'
                : 'Vaš e-mail je potvrđen u Supabase-u. Nastavljamo dalje.'
            );
            return;
          }
          throw backendError;
        }

        if (isOAuthFlow) {
          setState('verified');
          setMessage('Google prijava je uspješna. Nastavljamo dalje.');
          return;
        }

        if (user?.email_verified || (await isSupabaseEmailConfirmed())) {
          setState('verified');
          setMessage('Vaš e-mail je potvrđen. Možete nastaviti na porudžbinu.');
          return;
        }

        setState('pending');
        setMessage('E-mail još nije potvrđen. Otvorite link iz poruke i pokušajte ponovo.');
      } catch (error: unknown) {
        if (cancelled) return;
        if (isPkceVerifierMissingError(error)) {
          if (isOAuthFlow) {
            setState('error');
            setMessage(
              'Google prijava je prekinuta zbog lokalnog auth stanja (PKCE). Osvježite stranicu i pokušajte Google prijavu ponovo iz istog browsera.'
            );
          } else {
            setState('pending');
            setMessage(
              'Verifikacioni link je otvoren u drugom browseru ili je lokalna auth memorija obrisana. Prijavite se ponovo i otvorite novi verifikacioni link u istom browseru.'
            );
          }
          return;
        }
        setState('error');
        setMessage(getErrorMessage(error));
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isOAuthFlow, setAuthSession, updateUser]);

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
          <CardTitle className="text-center text-2xl text-primary">
            {isOAuthFlow ? 'Google prijava' : 'Verifikacija e-maila'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">{message}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={nextPath}>{isOAuthFlow ? 'Nastavi' : 'Nastavi na porudžbinu'}</Link>
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
