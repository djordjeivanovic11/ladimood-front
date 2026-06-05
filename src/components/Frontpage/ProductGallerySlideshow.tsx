'use client';

import React, { useMemo } from 'react';
import type { Product } from '@/app/types/types';
import { getSortedProductMedia } from '@/components/Management/catalog/catalog-image';
import { AutoScrollingGallery } from '@/components/Frontpage/AutoScrollingGallery';

type ProductGallerySlideshowProps = {
  products: Product[];
};

function getProductSlideshowImages(products: Product[]) {
  const sortedProducts = [...products].sort(
    (left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0) || left.id - right.id
  );

  return sortedProducts.flatMap((product) => {
    const media = getSortedProductMedia(product);
    return media.slice(1).map((item) => ({
      key: `${product.id}-${item.id}`,
      src: item.url,
      alt: item.alt_text?.trim() || product.name,
    }));
  });
}

export function ProductGallerySlideshow({ products }: ProductGallerySlideshowProps) {
  const images = useMemo(() => getProductSlideshowImages(products), [products]);

  if (images.length === 0) return null;

  return (
    <div className="relative bg-muted/50">
      <AutoScrollingGallery images={images} scrollSpeed={4} />
    </div>
  );
}
