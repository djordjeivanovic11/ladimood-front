'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import ProductFilter from './ProductFilter';
import ProductGrid from './ProductGrid';
import { Product } from '@/app/types/types';
import { useProductsQuery } from '@/hooks/queries/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { data: products = [], isLoading } = useProductsQuery();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [showNewestArrivals, setShowNewestArrivals] = useState<boolean>(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Get category from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category');
      if (category) {
        setSelectedCategory([category.charAt(0).toUpperCase() + category.slice(1)]);
      }
    }
  }, []);

  // Filter products based on selected criteria
  const filterProducts = useCallback(() => {
    if (!products.length) return;

    let filtered = [...products];

    // Apply category filter
    if (selectedCategory.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategory.some((category) => product.category?.includes(category))
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      (product) => product.price >= selectedPriceRange[0] && product.price <= selectedPriceRange[1]
    );

    // Apply sorting
    if (sortBy === 'priceLowToHigh') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHighToLow') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedPriceRange, sortBy]);

  // Apply filters when products or filter criteria change
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      filterProducts();
    }
  }, [filterProducts, isLoading, products]);

  return (
    <Suspense fallback={<ShopLoadingSkeleton />}>
      <div className="flex flex-col bg-background md:flex-row">
        {/* Filters */}
        <div className="md:w-1/4">
          <ProductFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            showNewestArrivals={showNewestArrivals}
            setShowNewestArrivals={setShowNewestArrivals}
            selectedPriceRange={selectedPriceRange}
            setSelectedPriceRange={setSelectedPriceRange}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {/* Products */}
        <div className="flex-1 bg-background">
          {isLoading ? (
            <ShopLoadingSkeleton />
          ) : filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
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
