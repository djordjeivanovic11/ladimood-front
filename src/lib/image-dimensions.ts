export type ImageDimensions = {
  width: number;
  height: number;
};

export function getImageAspectRatio({ width, height }: ImageDimensions): number {
  if (height <= 0 || width <= 0) return 0;
  return width / height;
}

export function getImageDimensions(src: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.decoding = 'async';

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      reject(new Error(`Failed to load image dimensions for ${src}`));
    };

    image.src = src;
  });
}

export function dimensionKey({ width, height }: ImageDimensions): string {
  return `${width}x${height}`;
}

export function pickUniformSizeGroup<T extends { src: string }>(
  items: T[],
  dimensionsBySrc: Map<string, ImageDimensions>
): { items: T[]; aspectRatio: number } | null {
  if (items.length === 0) return null;

  const grouped = new Map<string, { items: T[]; aspectRatio: number }>();

  for (const item of items) {
    const dimensions = dimensionsBySrc.get(item.src);
    if (!dimensions) continue;

    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) continue;

    const key = dimensionKey(dimensions);
    const aspectRatio = getImageAspectRatio(dimensions);
    const existing = grouped.get(key);

    grouped.set(key, {
      items: [...(existing?.items ?? []), item],
      aspectRatio,
    });
  }

  let best: { items: T[]; aspectRatio: number } | null = null;

  for (const group of grouped.values()) {
    if (!best || group.items.length > best.items.length) {
      best = group;
    }
  }

  if (!best || best.items.length === 0 || best.aspectRatio <= 0) return null;

  return best;
}

const ASPECT_RATIO_EPSILON = 0.002;

export function aspectRatiosMatch(a: number, b: number): boolean {
  if (a <= 0 || b <= 0) return false;
  return Math.abs(a - b) <= ASPECT_RATIO_EPSILON;
}

export function pickUniformAspectRatioGroup<T extends { src: string }>(
  items: T[],
  dimensionsBySrc: Map<string, ImageDimensions>
): { items: T[]; aspectRatio: number } | null {
  if (items.length === 0) return null;

  const grouped = new Map<number, T[]>();

  for (const item of items) {
    const dimensions = dimensionsBySrc.get(item.src);
    if (!dimensions) continue;

    const ratio = getImageAspectRatio(dimensions);
    if (ratio <= 0) continue;

    const existingKey = [...grouped.keys()].find((key) => aspectRatiosMatch(key, ratio));
    const groupKey = existingKey ?? ratio;
    grouped.set(groupKey, [...(grouped.get(groupKey) ?? []), item]);
  }

  let bestItems: T[] = [];
  let bestRatio = 0;

  for (const [ratio, groupItems] of grouped) {
    if (groupItems.length > bestItems.length) {
      bestItems = groupItems;
      bestRatio = ratio;
    }
  }

  if (bestItems.length === 0 || bestRatio <= 0) return null;

  return { items: bestItems, aspectRatio: bestRatio };
}
