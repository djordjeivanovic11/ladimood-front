import type { Category, Collection, Product, ProductMedia } from '@/app/types/types';

function bySortOrder(a: ProductMedia, b: ProductMedia) {
  const aOrder = a.sort_order ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sort_order ?? Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.id - b.id;
}

export function getPrimaryProductMedia(product: Product) {
  return getSortedProductMedia(product)[0] ?? null;
}

export function getSortedProductMedia(product: Product): ProductMedia[] {
  return sortProductMediaList(product.media ?? []);
}

export function sortProductMediaList(media: ProductMedia[]): ProductMedia[] {
  return [...media].sort(bySortOrder).filter((item) => item.url?.trim());
}

export function getPrimaryProductImageUrl(product: Product): string | null {
  return getPrimaryProductMedia(product)?.url ?? product.image_url ?? null;
}

export function getCategoryImageUrl(category: Category): string | null {
  return category.image_url ?? null;
}

export function getCollectionHeroUrl(collection: Collection): string | null {
  return collection.hero_image_url ?? null;
}
