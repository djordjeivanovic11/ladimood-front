'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductFilter from './ProductFilter';
import ProductGrid from './ProductGrid';
import {
  useCategoriesQuery,
  useCollectionsQuery,
  useProductsQuery,
} from '@/hooks/queries/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { sortProductsByDisplayOrder } from '@/lib/product-order';

function ShopLoadingSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 justify-start gap-6 sm:grid-cols-[repeat(auto-fit,minmax(15.5rem,22rem))] lg:grid-cols-[repeat(auto-fit,minmax(17.5rem,24rem))]">
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

function parseFilterId(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePriceRange(searchParams: URLSearchParams, defaultMaxPrice: number): [number, number] {
  const maxPriceParam = searchParams.get('max_price');
  if (!maxPriceParam) return [0, defaultMaxPrice];

  const parsed = Number(maxPriceParam);
  return Number.isFinite(parsed) ? [0, parsed] : [0, defaultMaxPrice];
}

const ShopContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: categories = [] } = useCategoriesQuery();
  const { data: collections = [] } = useCollectionsQuery();

  const DEFAULT_MAX_PRICE = 500;

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(() =>
    parseFilterId(searchParams.get('category_id'))
  );
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(() =>
    parseFilterId(searchParams.get('collection_id'))
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>(() =>
    parsePriceRange(searchParams, DEFAULT_MAX_PRICE)
  );
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get('sort') || 'relevance');

  useEffect(() => {
    const categoryIdParam = searchParams.get('category_id');
    const collectionIdParam = searchParams.get('collection_id');
    const sortParam = searchParams.get('sort');

    setSelectedCategoryId(parseFilterId(categoryIdParam));
    setSelectedCollectionId(parseFilterId(collectionIdParam));
    setSelectedPriceRange(parsePriceRange(searchParams, DEFAULT_MAX_PRICE));

    if (sortParam) setSortBy(sortParam);
    else setSortBy('relevance');
  }, [searchParams, DEFAULT_MAX_PRICE]);

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

    if (selectedCollectionId) params.set('collection_id', String(selectedCollectionId));
    else params.delete('collection_id');

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
  }, [selectedCategoryId, selectedCollectionId, selectedPriceRange, sortBy, DEFAULT_MAX_PRICE]);

  const { data: products = [], isLoading } = useProductsQuery({
    category_id: selectedCategoryId ?? undefined,
    collection_id: selectedCollectionId ?? undefined,
    min_price: selectedPriceRange[0],
    max_price: selectedPriceRange[1],
  });

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === 'priceLowToHigh') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceHighToLow') return list.sort((a, b) => b.price - a.price);
    return sortProductsByDisplayOrder(list);
  }, [products, sortBy]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId)?.name ?? null;
  }, [categories, selectedCategoryId]);

  const activeCollectionName = useMemo(() => {
    if (!selectedCollectionId) return null;
    return collections.find((c) => c.id === selectedCollectionId)?.name ?? null;
  }, [collections, selectedCollectionId]);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    if (categoryId !== null) {
      setSelectedCollectionId(null);
    }
  };

  const handleCollectionChange = (collectionId: number | null) => {
    setSelectedCollectionId(collectionId);
    if (collectionId !== null) {
      setSelectedCategoryId(null);
    }
  };

  const hasActiveFilters =
    !!selectedCategoryId ||
    !!selectedCollectionId ||
    selectedPriceRange[1] !== DEFAULT_MAX_PRICE ||
    sortBy !== 'relevance';

  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 py-8 md:flex-row md:px-6">
      {/* Filters */}
      <div className="w-full shrink-0 md:w-72 lg:w-64">
        <ProductFilter
          categories={categories}
          collections={collections}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={handleCategoryChange}
          selectedCollectionId={selectedCollectionId}
          setSelectedCollectionId={handleCollectionChange}
          selectedPriceRange={selectedPriceRange}
          setSelectedPriceRange={setSelectedPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {/* Products */}
      <div className="min-w-0 w-full flex-1">
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
            {activeCollectionName && (
              <button
                type="button"
                onClick={() => setSelectedCollectionId(null)}
                className="rounded-full border bg-background px-3 py-1 text-sm text-foreground hover:bg-muted"
              >
                {activeCollectionName} ×
              </button>
            )}
            {selectedPriceRange[1] !== DEFAULT_MAX_PRICE && (
              <button
                type="button"
                onClick={() => setSelectedPriceRange([0, DEFAULT_MAX_PRICE])}
                className="rounded-full border bg-background px-3 py-1 text-sm text-foreground hover:bg-muted"
              >
                Do €{selectedPriceRange[1]} ×
              </button>
            )}
            {sortBy !== 'relevance' && (
              <button
                type="button"
                onClick={() => setSortBy('relevance')}
                className="rounded-full border bg-background px-3 py-1 text-sm text-foreground hover:bg-muted"
              >
                {sortBy === 'priceLowToHigh' ? 'Cijena ↑' : 'Cijena ↓'} ×
              </button>
            )}
            <Button
              variant="ghost"
              className="h-8 px-3 text-sm"
              onClick={() => {
                setSelectedCategoryId(null);
                setSelectedCollectionId(null);
                setSelectedPriceRange([0, DEFAULT_MAX_PRICE]);
                setSortBy('relevance');
              }}
            >
              Obriši sve
            </Button>
          </div>
        )}

        {isLoading ? (
          <ShopLoadingSkeleton />
        ) : sortedProducts.length > 0 ? (
          <ProductGrid products={sortedProducts} variant="shop" />
        ) : (
          <div className="flex h-full min-h-[400px] items-center justify-center">
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? 'Nema proizvoda za odabrane filtere.'
                : 'Trenutno nema proizvoda u ponudi.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Shop: React.FC = () => (
  <Suspense fallback={<ShopLoadingSkeleton />}>
    <ShopContent />
  </Suspense>
);

export default Shop;
