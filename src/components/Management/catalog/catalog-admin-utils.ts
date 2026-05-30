import axios from 'axios';
import type { Product } from '@/app/types/types';

export type PublishCheck = {
  key: string;
  label: string;
  passed: boolean;
  current?: number;
  required_min?: number;
};

export function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object' && 'detail' in data) {
      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === 'string' && detail.trim()) return detail;
      if (detail && typeof detail === 'object' && 'message' in detail) {
        const message = (detail as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) return message;
      }
    }
    const message = err.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export function derivePublishChecks(product: Product): PublishCheck[] {
  const activeVariants = product.variants?.filter((variant) => variant.is_active).length ?? 0;
  const mediaCount = product.media?.length ?? 0;
  const hasTaxonomy = Boolean(
    product.category_id ?? product.category?.id ?? product.collection_id ?? product.collection?.id
  );
  const basicsReady =
    Boolean(product.name?.trim() && product.description?.trim()) && product.price != null;

  return [
    {
      key: 'basics',
      label: 'Naziv, opis i cijena',
      passed: basicsReady,
    },
    {
      key: 'media',
      label: 'Najmanje 1 slika proizvoda',
      passed: mediaCount > 0,
      current: mediaCount,
      required_min: 1,
    },
    {
      key: 'taxonomy',
      label: 'Kategorija ili kolekcija',
      passed: hasTaxonomy,
    },
    {
      key: 'variant',
      label: 'Najmanje 1 aktivna varijanta',
      passed: activeVariants > 0,
      current: activeVariants,
      required_min: 1,
    },
  ];
}

export function parsePublishChecksFromError(err: unknown): PublishCheck[] | null {
  if (!axios.isAxiosError(err)) return null;
  const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
  if (!detail || typeof detail !== 'object') return null;

  const code = (detail as { code?: unknown }).code;
  const checks = (detail as { checks?: unknown }).checks;
  if (code !== 'publish_validation_failed' || !Array.isArray(checks)) return null;

  return checks
    .map<PublishCheck | null>((item) => {
      if (!item || typeof item !== 'object') return null;
      const value = item as {
        key?: unknown;
        label?: unknown;
        passed?: unknown;
        current?: unknown;
        required_min?: unknown;
      };
      if (
        typeof value.key !== 'string' ||
        typeof value.label !== 'string' ||
        typeof value.passed !== 'boolean'
      ) {
        return null;
      }
      const parsed: PublishCheck = {
        key: value.key,
        label: value.label,
        passed: value.passed,
      };
      if (typeof value.current === 'number') parsed.current = value.current;
      if (typeof value.required_min === 'number') parsed.required_min = value.required_min;
      return parsed;
    })
    .filter((item): item is PublishCheck => item !== null);
}
