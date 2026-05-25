import type { CSSProperties } from 'react';
import type { ProductMedia } from '@/app/types/types';

export type MediaFraming = Pick<ProductMedia, 'focal_x' | 'focal_y' | 'zoom'>;

export function resolveMediaFraming(framing?: MediaFraming | null) {
  return {
    focalX: Math.min(100, Math.max(0, framing?.focal_x ?? 50)),
    focalY: Math.min(100, Math.max(0, framing?.focal_y ?? 50)),
    zoom: Math.min(3, Math.max(1, framing?.zoom ?? 1)),
  };
}

export function getFramedImageStyle(framing?: MediaFraming | null): CSSProperties {
  const { focalX, focalY, zoom } = resolveMediaFraming(framing);
  return {
    objectFit: 'cover',
    objectPosition: `${focalX}% ${focalY}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${focalX}% ${focalY}%`,
  };
}
