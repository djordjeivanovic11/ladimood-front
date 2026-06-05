'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductMedia } from '@/app/types/types';
import { FramedImage } from '@/components/Management/catalog/FramedImage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProductImageGalleryDialog } from './ProductImageGalleryDialog';

type ProductCardImageCarouselProps = {
  media: ProductMedia[];
  productName: string;
  sizes: string;
  isSoldOut?: boolean;
  isCardHovered?: boolean;
};

const SWIPE_THRESHOLD = 40;
const AUTO_ADVANCE_MS = 2000;
const MOBILE_AUTO_ADVANCE_MS = 1000;

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function useCanHover() {
  const [canHover, setCanHover] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateCanHover = () => setCanHover(mediaQuery.matches);

    updateCanHover();
    mediaQuery.addEventListener('change', updateCanHover);

    return () => mediaQuery.removeEventListener('change', updateCanHover);
  }, []);

  return canHover;
}

export function ProductCardImageCarousel({
  media,
  productName,
  sizes,
  isSoldOut = false,
  isCardHovered = false,
}: ProductCardImageCarouselProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [galleryIndex, setGalleryIndex] = React.useState(0);
  const [isInView, setIsInView] = React.useState(false);
  const canHover = useCanHover();
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = React.useRef(false);

  const imageCount = media.length;
  const hasMultipleImages = imageCount > 1;
  const normalizedDisplayIndex = clampIndex(activeIndex, imageCount);

  React.useLayoutEffect(() => {
    if (!canHover) return;

    if (!isCardHovered) {
      setActiveIndex(0);
      return;
    }

    if (hasMultipleImages && !galleryOpen) {
      setActiveIndex((current) => (current === 0 ? 1 : current));
    }
  }, [canHover, galleryOpen, hasMultipleImages, isCardHovered]);

  React.useEffect(() => {
    const node = carouselRef.current;
    if (!node || canHover) return;

    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      threshold: 0.6,
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [canHover]);

  React.useEffect(() => {
    if (canHover || !isInView || !hasMultipleImages || galleryOpen) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => clampIndex(current + 1, imageCount));
    }, MOBILE_AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [canHover, galleryOpen, hasMultipleImages, imageCount, isInView]);

  React.useEffect(() => {
    if (canHover || isInView) return;

    setActiveIndex(0);
  }, [canHover, isInView]);

  React.useEffect(() => {
    if (!canHover || !isCardHovered || !hasMultipleImages || galleryOpen) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => clampIndex(current + 1, imageCount));
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [canHover, galleryOpen, hasMultipleImages, imageCount, isCardHovered]);

  React.useEffect(() => {
    if (imageCount <= 1) return;

    const nextMedia = media[clampIndex(normalizedDisplayIndex + 1, imageCount)];
    if (!nextMedia?.url) return;

    const preloadImage = new window.Image();
    preloadImage.src = nextMedia.url;
  }, [imageCount, media, normalizedDisplayIndex]);

  if (imageCount === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {isSoldOut ? <SoldOutBadge /> : null}
        <FramedImage
          src="/images/default-product.jpg"
          alt={productName}
          sizes={sizes}
          containerClassName="h-full w-full transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  const goToIndex = (nextIndex: number) => {
    setActiveIndex(clampIndex(nextIndex, imageCount));
  };

  const openGallery = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    setGalleryIndex(normalizedDisplayIndex);
    setGalleryOpen(true);
  };

  const handleControlClick = (event: React.MouseEvent<HTMLButtonElement>, nextIndex: number) => {
    event.stopPropagation();
    goToIndex(nextIndex);
  };

  const handleDotClick = (event: React.MouseEvent<HTMLButtonElement>, nextIndex: number) => {
    event.stopPropagation();
    goToIndex(nextIndex);
  };

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

    suppressClickRef.current = true;
    goToIndex(deltaX > 0 ? normalizedDisplayIndex - 1 : normalizedDisplayIndex + 1);
  };

  return (
    <>
      <div
        ref={carouselRef}
        className="relative aspect-square w-full overflow-hidden bg-muted [touch-action:pan-y]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isSoldOut ? <SoldOutBadge /> : null}

        {media.map((item, index) => (
          <FramedImage
            key={item.id}
            src={item.url}
            alt={item.alt_text || productName}
            framing={item}
            sizes={sizes}
            containerClassName={cn(
              'absolute inset-0 h-full w-full transition-opacity duration-300 ease-out',
              index === normalizedDisplayIndex ? 'opacity-100' : 'pointer-events-none opacity-0',
              !hasMultipleImages && 'transition-transform duration-500 group-hover:scale-[1.02]'
            )}
          />
        ))}

        <button
          type="button"
          className="absolute inset-0 z-[5] cursor-zoom-in"
          onClick={openGallery}
          aria-label={`Otvori galeriju za ${productName}`}
        />

        {hasMultipleImages ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 opacity-70 shadow-md backdrop-blur-sm transition-opacity hover:bg-background hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={(event) => handleControlClick(event, normalizedDisplayIndex - 1)}
              aria-label="Prethodna slika"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 opacity-70 shadow-md backdrop-blur-sm transition-opacity hover:bg-background hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={(event) => handleControlClick(event, normalizedDisplayIndex + 1)}
              aria-label="Sljedeća slika"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-background/55 px-2.5 py-1.5 backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    index === normalizedDisplayIndex ? 'w-4 bg-primary' : 'w-1.5 bg-foreground/35'
                  )}
                  onClick={(event) => handleDotClick(event, index)}
                  aria-label={`Prikaži sliku ${index + 1}`}
                  aria-current={index === normalizedDisplayIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <ProductImageGalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        media={media}
        productName={productName}
        initialIndex={galleryIndex}
        onIndexChange={setGalleryIndex}
      />
    </>
  );
}

function SoldOutBadge() {
  return (
    <div
      className="sold-out-badge absolute right-2.5 top-2.5 z-20 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground sm:px-3 sm:py-1.5 sm:text-xs"
      aria-label="Sold out"
    >
      SOLD OUT
    </div>
  );
}
