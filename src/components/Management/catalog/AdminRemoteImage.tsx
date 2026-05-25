'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type AdminRemoteImageProps = {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackClassName?: string;
  fallbackLabel?: string;
};

export function AdminRemoteImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackClassName,
  fallbackLabel = 'N/A',
}: AdminRemoteImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const hasSrc = Boolean(src?.trim());

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!hasSrc || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md bg-muted text-xs text-muted-foreground',
          fallbackClassName ?? className
        )}
      >
        {fallbackLabel}
      </div>
    );
  }

  return (
    <Image
      src={src ?? ''}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
