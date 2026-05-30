import type { EmailOtpType, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type AuthCallbackParams = {
  code: string | null;
  tokenHash: string | null;
  type: EmailOtpType | null;
};

/**
 * Finish an auth redirect (Google OAuth, email verify, password recovery).
 *
 * createBrowserClient enables detectSessionInUrl + PKCE, so getSession() already
 * waits for the client to exchange ?code=... from the URL. Calling
 * exchangeCodeForSession() again consumes nothing and throws
 * pkce_code_verifier_not_found even when login succeeded.
 */
export async function completeAuthCallback(
  params: AuthCallbackParams
): Promise<{ session: Session | null; error: Error | null }> {
  const { tokenHash, type } = params;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
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

  for (let i = 0; i < 6; i += 1) {
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
