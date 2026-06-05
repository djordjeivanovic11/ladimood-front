import type { Product } from '@/app/types/types';

/** Storefront order: admin drag-and-drop `sort_order`, then id for stability. */
export function sortProductsByDisplayOrder(products: Product[]): Product[] {
  return [...products].sort(
    (left, right) =>
      (left.sort_order ?? Number.MAX_SAFE_INTEGER) -
        (right.sort_order ?? Number.MAX_SAFE_INTEGER) || left.id - right.id
  );
}
