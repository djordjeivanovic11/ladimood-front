import type { MediaFraming } from '@/components/Management/catalog/media-frame';
import { FramedImage } from '@/components/Management/catalog/FramedImage';
import { cn } from '@/lib/utils';

type AdminThumbnailProps = {
  src: string | null | undefined;
  alt: string;
  framing?: MediaFraming | null;
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClassMap = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
} as const;

export function AdminThumbnail({ src, alt, framing, size = 'md', className }: AdminThumbnailProps) {
  if (!src?.trim()) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md border border-dashed bg-muted text-[10px] font-medium text-muted-foreground',
          sizeClassMap[size],
          className
        )}
      >
        —
      </div>
    );
  }

  return (
    <FramedImage
      src={src}
      alt={alt}
      framing={framing}
      containerClassName={cn('shrink-0 rounded-md', sizeClassMap[size], className)}
    />
  );
}
