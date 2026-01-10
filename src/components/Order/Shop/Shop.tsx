'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductFilter from './ProductFilter';
import ProductGrid from './ProductGrid';
import { useCategoriesQuery, useProductsQuery } from '@/hooks/queries/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

function ShopLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 p-8 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

const Shop: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: categories = [] } = useCategoriesQuery();

  const DEFAULT_MAX_PRICE = 500;

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([
    0,
    DEFAULT_MAX_PRICE,
  ]);
  const [sortBy, setSortBy] = useState<string>('relevance');

  useEffect(() => {
    const categoryIdParam = searchParams.get('category_id');
    const maxPriceParam = searchParams.get('max_price');
    const sortParam = searchParams.get('sort');

    if (categoryIdParam) {
      const parsed = Number(categoryIdParam);
      setSelectedCategoryId(Number.isFinite(parsed) ? parsed : null);
    } else {
      setSelectedCategoryId(null);
    }

    if (maxPriceParam) {
      const parsed = Number(maxPriceParam);
      if (Number.isFinite(parsed)) setSelectedPriceRange([0, parsed]);
    } else {
      setSelectedPriceRange([0, DEFAULT_MAX_PRICE]);
    }

    if (sortParam) setSortBy(sortParam);
  }, [searchParams]);

  // Backwards compatibility for old links like /shop?category=hoodies
  useEffect(() => {
    const categoryNameParam = searchParams.get('category');
    if (!categoryNameParam || categories.length === 0 || selectedCategoryId) return;

    const normalized = categoryNameParam.trim().toLowerCase();
    const match = categories.find((c) => c.name.trim().toLowerCase() === normalized);
    if (match) {
      setSelectedCategoryId(match.id);
    }
  }, [categories, searchParams, selectedCategoryId]);

  // Push URL state whenever filters change (shareable links)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategoryId) params.set('category_id', String(selectedCategoryId));
    else params.delete('category_id');

    if (selectedPriceRange[1] !== DEFAULT_MAX_PRICE) {
      params.set('max_price', String(selectedPriceRange[1]));
    } else {
      params.delete('max_price');
    }

    if (sortBy && sortBy !== 'relevance') params.set('sort', sortBy);
    else params.delete('sort');

    // Drop legacy param if present
    params.delete('category');

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery !== currentQuery) {
      router.replace(`/shop${nextQuery ? `?${nextQuery}` : ''}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, selectedPriceRange, sortBy, DEFAULT_MAX_PRICE]);

  const { data: products = [], isLoading } = useProductsQuery({
    category_id: selectedCategoryId ?? undefined,
    min_price: selectedPriceRange[0],
    max_price: selectedPriceRange[1],
  });

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === 'priceLowToHigh') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceHighToLow') return list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sortBy]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId)?.name ?? null;
  }, [categories, selectedCategoryId]);

  const hasActiveFilters =
    !!selectedCategoryId || selectedPriceRange[1] !== DEFAULT_MAX_PRICE || sortBy !== 'relevance';

  return (
    <Suspense fallback={<ShopLoadingSkeleton />}>
      <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-4 py-8 md:flex-row md:px-6">
        {/* Filters */}
        <div className="md:w-80">
          <ProductFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            selectedPriceRange={selectedPriceRange}
            setSelectedPriceRange={setSelectedPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {/* Products */}
        <div className="flex-1">
          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeCategoryName && (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className="rounded-full border bg-background px-3 py-1 text-sm text-foreground hover:bg-muted"
                >
                  {activeCategoryName} ×
                </button>
              )}
              {selectedPriceRange[1] !== DEFAULT_MAX_PRICE && (
                <button
                  type="button"
                  onClick={() => setSelectedPriceRange([0, DEFAULT_MAX_PRICE])}
                  className="rounded-full border bg-background px-3 py-1 text-sm text-foreground hover:bg-muted"
                >
                  Up to €{selectedPriceRange[1]} ×
                </button>
              )}
              {sortBy !== 'relevance' && (
                <button
                  type="button"
                  onClick={() => setSortBy('relevance')}
                  className="rounded-full border bg-background px-3 py-1 text-sm text-foreground hover:bg-muted"
                >
                  {sortBy === 'priceLowToHigh' ? 'Price ↑' : 'Price ↓'} ×
                </button>
              )}
              <Button
                variant="ghost"
                className="h-8 px-3 text-sm"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSelectedPriceRange([0, DEFAULT_MAX_PRICE]);
                  setSortBy('relevance');
                }}
              >
                Clear all
              </Button>
            </div>
          )}

          {isLoading ? (
            <ShopLoadingSkeleton />
          ) : sortedProducts.length > 0 ? (
            <ProductGrid products={sortedProducts} />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <p className="text-muted-foreground">No products found for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default Shop;
