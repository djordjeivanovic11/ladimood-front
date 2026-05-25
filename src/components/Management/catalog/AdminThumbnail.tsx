import { AdminRemoteImage } from '@/components/Management/catalog/AdminRemoteImage';
import { cn } from '@/lib/utils';

type AdminThumbnailProps = {
  src: string | null | undefined;
  alt: string;
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClassMap = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
} as const;

export function AdminThumbnail({ src, alt, size = 'md', className }: AdminThumbnailProps) {
  return (
    <AdminRemoteImage
      src={src}
      alt={alt}
      width={96}
      height={96}
      className={cn('shrink-0 rounded-md object-cover', sizeClassMap[size], className)}
      fallbackClassName={cn(
        'shrink-0 rounded-md border border-dashed text-[10px] font-medium',
        sizeClassMap[size],
        className
      )}
      fallbackLabel="—"
    />
  );
}
