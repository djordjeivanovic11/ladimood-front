import { useQuery } from '@tanstack/react-query';
import { getCategories, getProducts } from '@/api/account/axios';
import type { Category, Product } from '@/app/types/types';

interface ProductFilters {
  category_id?: number;
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
    queryFn: () => getProducts(filters?.category_id, filters?.min_price, filters?.max_price),
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
