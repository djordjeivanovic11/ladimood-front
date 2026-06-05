const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'media';

export function getSupabasePublicUrl(objectPath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!base) return null;
  return `${base}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

export function getCreatorChallengeImageUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CREATOR_CHALLENGE_IMAGE_URL?.trim() ||
    getSupabasePublicUrl('brand/posh.png') ||
    '/images/posh.png'
  );
}
