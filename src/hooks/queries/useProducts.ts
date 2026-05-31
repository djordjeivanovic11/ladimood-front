import { useQuery } from '@tanstack/react-query';
import { getCategories, getCollections, getProducts } from '@/api/account/axios';
import type { Category, Collection, Product } from '@/app/types/types';

interface ProductFilters {
  category_id?: number;
  collection_id?: number;
  min_price?: number;
  max_price?: number;
}

export const productKeys = {
  all: ['products'] as const,
  list: (filters?: ProductFilters) => [...productKeys.all, 'list', filters] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
};

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Alias for backwards compatibility
export const useProductsQuery = useProducts;

export function useProduct(productId: number) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      const products = await getProducts();
      const product = products.find((p: Product) => p.id === productId);
      if (!product) throw new Error('Product not found');
      return product;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
};

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: categoryKeys.list(),
    queryFn: () => getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Alias for backwards compatibility
export const useCategoriesQuery = useCategories;

export const collectionKeys = {
  all: ['collections'] as const,
  list: () => [...collectionKeys.all, 'list'] as const,
};

export function useCollections() {
  return useQuery<Collection[]>({
    queryKey: collectionKeys.list(),
    queryFn: () => getCollections(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Alias for backwards compatibility
export const useCollectionsQuery = useCollections;
