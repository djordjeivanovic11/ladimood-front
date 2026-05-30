import type { EmailOtpType, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type AuthCallbackParams = {
  code: string | null;
  tokenHash: string | null;
  type: EmailOtpType | null;
  accessToken: string | null;
  refreshToken: string | null;
  errorDescription: string | null;
};

/** Read auth callback params from query string and URL hash (Supabase uses both). */
export function readAuthCallbackParams(href = window.location.href): AuthCallbackParams {
  const url = new URL(href);
  const params: Record<string, string> = {};

  if (url.hash.startsWith('#')) {
    try {
      new URLSearchParams(url.hash.slice(1)).forEach((value, key) => {
        params[key] = value;
      });
    } catch {
      // ignore malformed hash
    }
  }

  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const rawType = params.type;
  const type =
    rawType === 'signup' ||
    rawType === 'invite' ||
    rawType === 'magiclink' ||
    rawType === 'recovery' ||
    rawType === 'email_change' ||
    rawType === 'email'
      ? rawType
      : null;

  return {
    code: params.code ?? null,
    tokenHash: params.token_hash ?? params.token ?? null,
    type,
    accessToken: params.access_token ?? null,
    refreshToken: params.refresh_token ?? null,
    errorDescription: params.error_description ?? params.error ?? null,
  };
}

/**
 * Finish an auth redirect (Google OAuth, email verify, password recovery).
 *
 * createBrowserClient enables detectSessionInUrl + PKCE, so getSession() usually
 * completes the ?code= exchange. Email templates may still redirect with hash
 * tokens (#access_token=...) which PKCE-only auto-detect rejects — we handle
 * those with setSession().
 */
export async function completeAuthCallback(
  params?: Partial<AuthCallbackParams>
): Promise<{ session: Session | null; error: Error | null }> {
  const resolved =
    typeof window !== 'undefined'
      ? { ...readAuthCallbackParams(), ...params }
      : {
          code: params?.code ?? null,
          tokenHash: params?.tokenHash ?? null,
          type: params?.type ?? null,
          accessToken: params?.accessToken ?? null,
          refreshToken: params?.refreshToken ?? null,
          errorDescription: params?.errorDescription ?? null,
        };

  if (resolved.errorDescription) {
    return { session: null, error: new Error(resolved.errorDescription) };
  }

  if (resolved.tokenHash && resolved.type) {
    const { error } = await supabase.auth.verifyOtp({
      type: resolved.type,
      token_hash: resolved.tokenHash,
    });
    if (error) {
      return { session: null, error: new Error(error.message) };
    }
  }

  const readSession = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      return { session: null as Session | null, error: new Error(error.message) };
    }
    return { session, error: null as Error | null };
  };

  let result = await readSession();
  if (result.error) {
    return result;
  }
  if (result.session) {
    return result;
  }

  if (resolved.accessToken && resolved.refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: resolved.accessToken,
      refresh_token: resolved.refreshToken,
    });
    if (error) {
      return { session: null, error: new Error(error.message) };
    }
    if (data.session) {
      return { session: data.session, error: null };
    }
  }

  for (let i = 0; i < 10; i += 1) {
    await delay(300);
    result = await readSession();
    if (result.error) {
      return result;
    }
    if (result.session) {
      return result;
    }
  }

  return { session: null, error: null };
}

export async function isSupabaseEmailConfirmed(): Promise<boolean> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return false;
  return Boolean(user.email_confirmed_at);
}
