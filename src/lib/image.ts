export const IMAGE_SIZES = {
  productCardShop: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px',
  productCardHome: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw',
  categoryCard: '(max-width: 768px) 100vw, 33vw',
  gallerySlide:
    '(max-width: 640px) 200px, (max-width: 768px) 300px, (max-width: 1024px) 450px, 600px',
  shareIdeas: '(max-width: 768px) 100vw, 50vw',
  creatorChallenge: '(max-width: 768px) 100vw, 50vw',
  cartThumb: '96px',
  orderThumb: '64px',
} as const;

/** Skip Next optimizer only for sources it cannot process. */
export function shouldUnoptimizeImage(src: string): boolean {
  const normalized = src?.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.startsWith('data:image/')) return true;
  if (normalized.endsWith('.svg')) return true;
  return normalized.startsWith('blob:');
}
