export function isPkceVerifierMissingError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const maybeError = error as { code?: unknown; message?: unknown; name?: unknown };
  const code = typeof maybeError.code === 'string' ? maybeError.code.toLowerCase() : '';
  const message = typeof maybeError.message === 'string' ? maybeError.message.toLowerCase() : '';
  const name = typeof maybeError.name === 'string' ? maybeError.name.toLowerCase() : '';

  return (
    code.includes('pkce_code_verifier_not_found') ||
    name.includes('authpkcecodeverifiermissingerror') ||
    message.includes('pkce code verifier not found')
  );
}
