/** Use unoptimized Next/Image for remote URLs (e.g. Supabase) to avoid optimizer timeouts. */
export function shouldUnoptimizeImage(src: string): boolean {
  if (!src?.trim() || src.startsWith('/')) {
    return false;
  }
  try {
    const { protocol } = new URL(src);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}
