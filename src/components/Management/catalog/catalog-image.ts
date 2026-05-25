import type { Category, Collection, Product, ProductMedia } from '@/app/types/types';

function bySortOrder(a: ProductMedia, b: ProductMedia) {
  const aOrder = a.sort_order ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sort_order ?? Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.id - b.id;
}

export function getPrimaryProductImageUrl(product: Product): string | null {
  const sortedMedia = [...(product.media ?? [])].sort(bySortOrder);
  const mediaUrl = sortedMedia.find((item) => item.url?.trim())?.url ?? null;
  return mediaUrl ?? product.image_url ?? null;
}

export function getCategoryImageUrl(category: Category): string | null {
  return category.image_url ?? null;
}

export function getCollectionHeroUrl(collection: Collection): string | null {
  return collection.hero_image_url ?? null;
}
