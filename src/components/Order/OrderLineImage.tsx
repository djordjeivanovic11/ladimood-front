'use client';

import Image from 'next/image';
import { shouldUnoptimizeImage } from '@/lib/image';
import { cn } from '@/lib/utils';

type OrderLineImageProps = {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClasses = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
} as const;

export function OrderLineImage({ src, alt, size = 'md', className }: OrderLineImageProps) {
  const imageSrc = src?.trim();

  if (!imageSrc) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md border border-dashed bg-muted text-xs text-muted-foreground',
          sizeClasses[size],
          className
        )}
      >
        N/A
      </div>
    );
  }

  const dimension = size === 'sm' ? 48 : 64;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={dimension}
      height={dimension}
      unoptimized={shouldUnoptimizeImage(imageSrc)}
      className={cn(
        'shrink-0 rounded-md border border-border/50 object-cover',
        sizeClasses[size],
        className
      )}
    />
  );
}
