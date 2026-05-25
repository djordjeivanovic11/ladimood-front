'use client';

import { useEffect } from 'react';
import { useCartQuery } from '@/hooks/queries/useCart';
import { useCartStore } from '@/stores/useCartStore';

/** Keeps persisted cart store in sync with the server cart (React Query). */
export function useCartSync() {
  const setItems = useCartStore((state) => state.setItems);
  const { data } = useCartQuery();

  useEffect(() => {
    setItems(data?.items ?? []);
  }, [data, setItems]);
}
