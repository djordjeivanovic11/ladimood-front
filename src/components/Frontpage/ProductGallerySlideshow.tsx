'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/app/types/types';
import { getSortedProductMedia } from '@/components/Management/catalog/catalog-image';
import { AutoScrollingGallery } from '@/components/Frontpage/AutoScrollingGallery';
import {
  getImageDimensions,
  pickUniformAspectRatioGroup,
  type ImageDimensions,
} from '@/lib/image-dimensions';
import { sortProductsByDisplayOrder } from '@/lib/product-order';

type ProductGallerySlideshowProps = {
  products: Product[];
};

type SlideshowImage = {
  key: string;
  src: string;
  alt: string;
};

function getProductSlideshowImages(products: Product[]): SlideshowImage[] {
  return sortProductsByDisplayOrder(products).flatMap((product) => {
    const media = getSortedProductMedia(product);
    return media.slice(1).map((item) => ({
      key: `${product.id}-${item.id}`,
      src: item.url,
      alt: item.alt_text?.trim() || product.name,
    }));
  });
}

export function ProductGallerySlideshow({ products }: ProductGallerySlideshowProps) {
  const candidateImages = useMemo(() => getProductSlideshowImages(products), [products]);
  const [uniformGallery, setUniformGallery] = useState<{
    images: SlideshowImage[];
    aspectRatio: number;
  } | null>(null);

  useEffect(() => {
    if (candidateImages.length === 0) {
      setUniformGallery(null);
      return;
    }

    let cancelled = false;

    setUniformGallery(null);

    Promise.all(
      candidateImages.map(async (image) => {
        try {
          const dimensions = await getImageDimensions(image.src);
          return { image, dimensions };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (cancelled) return;

      const dimensionsBySrc = new Map<string, ImageDimensions>();
      const loadedImages: SlideshowImage[] = [];

      for (const result of results) {
        if (!result) continue;
        dimensionsBySrc.set(result.image.src, result.dimensions);
        loadedImages.push(result.image);
      }

      const uniformGroup = pickUniformAspectRatioGroup(loadedImages, dimensionsBySrc);
      if (!uniformGroup) {
        setUniformGallery(null);
        return;
      }

      setUniformGallery({
        images: uniformGroup.items,
        aspectRatio: uniformGroup.aspectRatio,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [candidateImages]);

  if (!uniformGallery || uniformGallery.images.length === 0) return null;

  return (
    <div className="relative bg-muted/50 py-2 sm:py-3">
      <AutoScrollingGallery
        images={uniformGallery.images}
        scrollSpeed={2.7}
        frameAspectRatio={uniformGallery.aspectRatio}
        pauseOnImageHoverOnly
        className="space-x-3 px-2 pb-0 sm:space-x-4 sm:px-3"
      />
    </div>
  );
}
