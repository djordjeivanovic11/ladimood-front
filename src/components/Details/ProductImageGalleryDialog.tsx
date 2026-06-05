'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductMedia } from '@/app/types/types';
import { FramedImage } from '@/components/Management/catalog/FramedImage';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ProductImageGalleryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: ProductMedia[];
  productName: string;
  initialIndex: number;
  onIndexChange?: (index: number) => void;
};

const SWIPE_THRESHOLD = 40;

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function ProductImageGalleryDialog({
  open,
  onOpenChange,
  media,
  productName,
  initialIndex,
  onIndexChange,
}: ProductImageGalleryDialogProps) {
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    if (open) {
      setActiveIndex(clampIndex(initialIndex, media.length));
    }
  }, [initialIndex, media.length, open]);

  const goToIndex = React.useCallback(
    (nextIndex: number) => {
      const normalizedIndex = clampIndex(nextIndex, media.length);
      setActiveIndex(normalizedIndex);
      onIndexChange?.(normalizedIndex);
    },
    [media.length, onIndexChange]
  );

  React.useEffect(() => {
    if (!open || media.length <= 1) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToIndex(activeIndex - 1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToIndex(activeIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, goToIndex, media.length, open]);

  if (media.length === 0) return null;

  const activeMedia = media[clampIndex(activeIndex, media.length)];
  const hasMultipleImages = media.length > 1;

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || !hasMultipleImages) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;

    goToIndex(deltaX > 0 ? activeIndex - 1 : activeIndex + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[96vh] max-w-[96vw] border-white/10 bg-background/95 p-3 shadow-2xl sm:max-w-5xl sm:p-4">
        <DialogTitle className="sr-only">{productName} galerija slika</DialogTitle>

        <div
          className="relative flex min-h-[60vh] items-center justify-center overflow-hidden rounded-lg bg-muted/40 [touch-action:pan-y] sm:min-h-[78vh]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <FramedImage
            src={activeMedia.url}
            alt={activeMedia.alt_text || productName}
            framing={activeMedia}
            sizes="96vw"
            containerClassName="h-[60vh] w-full sm:h-[78vh]"
          />

          {hasMultipleImages ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 shadow-lg backdrop-blur-sm hover:bg-background"
                onClick={() => goToIndex(activeIndex - 1)}
                aria-label="Prethodna slika"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 shadow-lg backdrop-blur-sm hover:bg-background"
                onClick={() => goToIndex(activeIndex + 1)}
                aria-label="Sljedeća slika"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-background/70 px-3 py-2 backdrop-blur-sm">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      'h-2 rounded-full transition-all',
                      index === activeIndex ? 'w-5 bg-primary' : 'w-2 bg-foreground/35'
                    )}
                    onClick={() => goToIndex(index)}
                    aria-label={`Prikaži sliku ${index + 1}`}
                    aria-current={index === activeIndex ? 'true' : undefined}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
