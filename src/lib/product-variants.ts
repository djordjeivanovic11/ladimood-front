import type { Product, ProductVariant, SizeType } from '@/app/types/types';
import { colorNameFromHex, normalizeHex } from '@/components/Management/catalog/catalog-colors';

export type ProductColorOption = {
  hex: string;
  name: string;
};

const SIZE_ORDER: SizeType[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function getActiveVariants(product: Product): ProductVariant[] {
  return (product.variants ?? []).filter((variant) => variant.is_active);
}

function resolveColorName(variant: ProductVariant, hex: string): string {
  const trimmedName = variant.color_name?.trim();
  if (trimmedName && !trimmedName.startsWith('#')) {
    return trimmedName;
  }

  return colorNameFromHex(hex) ?? 'Odabrana boja';
}

export function getProductColorOptions(product: Product): ProductColorOption[] {
  const colorsByHex = new Map<string, ProductColorOption>();

  for (const variant of getActiveVariants(product)) {
    const hex = normalizeHex(variant.color_hex);
    if (!hex || colorsByHex.has(hex)) continue;

    colorsByHex.set(hex, {
      hex,
      name: resolveColorName(variant, hex),
    });
  }

  return Array.from(colorsByHex.values());
}

export function getProductSizesForColor(product: Product, colorHex: string): SizeType[] {
  const normalizedColor = normalizeHex(colorHex);
  const sizes = new Set<SizeType>();

  for (const variant of getActiveVariants(product)) {
    if (normalizeHex(variant.color_hex) === normalizedColor) {
      sizes.add(variant.size);
    }
  }

  return SIZE_ORDER.filter((size) => sizes.has(size));
}

export function getProductDefaultSelections(
  product: Product
): { color: string; size: SizeType } | null {
  const colors = getProductColorOptions(product);
  if (colors.length === 0) return null;

  const color = colors[0].hex;
  const sizes = getProductSizesForColor(product, color);
  if (sizes.length === 0) return null;

  return { color, size: sizes[0] };
}
