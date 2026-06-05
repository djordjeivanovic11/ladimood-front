'use client';

import React, { useMemo } from 'react';
import Hero from '@/components/Frontpage/Hero';
import TaxonomyExplore from '@/components/Frontpage/TaxonomyExplore';
import ProductGrid from '@/components/Order/Shop/ProductGrid';
import Newsletter from '@/components/Frontpage/Newsletter';
import MontenegrinGallery from '@/components/Frontpage/MontenegrinGallery';
import { ProductGallerySlideshow } from '@/components/Frontpage/ProductGallerySlideshow';
import SuggestionBox from '@/components/Frontpage/ShareIdeas';
import { sortProductsByDisplayOrder } from '@/lib/product-order';
import { useProductsQuery } from '@/hooks/queries/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

function ProductLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 p-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function Frontpage() {
  const { data: products = [], isLoading } = useProductsQuery();
  const displayProducts = useMemo(() => sortProductsByDisplayOrder(products), [products]);

  return (
    <div className="bg-background">
      <div className="-mt-20 mb-16 md:-mt-24">
        <Hero />
      </div>

      <div className="mb-16">
        <MontenegrinGallery />
      </div>

      <div className="mb-16">
        {isLoading ? (
          <ProductLoadingSkeleton />
        ) : displayProducts.length > 0 ? (
          <ProductGrid products={displayProducts} />
        ) : (
          <p className="px-8 text-center text-muted-foreground">
            Trenutno nema proizvoda u ponudi. Uskoro dodajemo nove komade.
          </p>
        )}
      </div>

      {!isLoading && displayProducts.length > 0 ? (
        <div className="mb-16">
          <ProductGallerySlideshow products={displayProducts} />
        </div>
      ) : null}

      <div className="mb-16">
        <SuggestionBox />
      </div>

      <div className="mb-16">
        <TaxonomyExplore />
      </div>

      <div className="mt-16">
        <Newsletter />
      </div>
    </div>
  );
}
