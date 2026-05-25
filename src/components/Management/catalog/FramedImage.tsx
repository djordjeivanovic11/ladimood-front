'use client';

import React from 'react';
import Image from 'next/image';
import type { MediaFraming } from '@/components/Management/catalog/media-frame';
import { getFramedImageStyle } from '@/components/Management/catalog/media-frame';
import { cn } from '@/lib/utils';

type FramedImageProps = {
  src: string;
  alt: string;
  framing?: MediaFraming | null;
  className?: string;
  containerClassName?: string;
  unoptimized?: boolean;
};

export function FramedImage({
  src,
  alt,
  framing,
  className,
  containerClassName,
  unoptimized = true,
}: FramedImageProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src.trim() || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md border border-dashed bg-muted text-xs text-muted-foreground',
          containerClassName
        )}
      >
        N/A
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized={unoptimized}
        className={cn('h-full w-full', className)}
        style={getFramedImageStyle(framing)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
