'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { IMAGE_SIZES, shouldUnoptimizeImage } from '@/lib/image';
import { cn } from '@/lib/utils';

export type AutoScrollingGalleryImage = {
  src: string;
  alt: string;
  key?: string | number;
  width?: number;
  height?: number;
};

type AutoScrollingGalleryProps = {
  images: AutoScrollingGalleryImage[];
  scrollSpeed?: number;
  className?: string;
  /** Width / height for every slide frame. Defaults to 1 (square). */
  frameAspectRatio?: number;
  /** When true, only pauses while the cursor is over an image, not the surrounding strip. */
  pauseOnImageHoverOnly?: boolean;
};

export function AutoScrollingGallery({
  images,
  scrollSpeed = 2,
  className = '',
  frameAspectRatio = 1,
  pauseOnImageHoverOnly = false,
}: AutoScrollingGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || images.length === 0) return;

    let scrollAmount = 0;

    const scrollGallery = () => {
      if (scrollContainer && !pauseRef.current) {
        scrollAmount += scrollSpeed;
        if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollAmount = 0;
        }
        scrollContainer.scrollLeft = scrollAmount;
      }
      requestAnimationFrame(scrollGallery);
    };

    const handleMouseEnter = () => {
      pauseRef.current = true;
    };
    const handleMouseLeave = () => {
      pauseRef.current = false;
    };

    if (!pauseOnImageHoverOnly) {
      scrollContainer.addEventListener('mouseenter', handleMouseEnter);
      scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    }

    const animationId = requestAnimationFrame(scrollGallery);

    return () => {
      if (!pauseOnImageHoverOnly) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationId);
    };
  }, [images.length, pauseOnImageHoverOnly, scrollSpeed]);

  if (images.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className={cn(
        'scrollbar-hide flex space-x-4 overflow-x-auto px-4 pb-8 sm:space-x-6 sm:pb-12 md:space-x-8',
        className
      )}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {images.map((image, index) => (
        <div
          key={image.key ?? `${image.src}-${index}`}
          className="relative w-[200px] flex-none overflow-hidden sm:w-[300px] md:w-[450px] lg:w-[600px]"
          style={{ aspectRatio: frameAspectRatio }}
          onMouseEnter={
            pauseOnImageHoverOnly
              ? () => {
                  pauseRef.current = true;
                }
              : undefined
          }
          onMouseLeave={
            pauseOnImageHoverOnly
              ? () => {
                  pauseRef.current = false;
                }
              : undefined
          }
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={IMAGE_SIZES.gallerySlide}
            loading="lazy"
            unoptimized={shouldUnoptimizeImage(image.src)}
            className="rounded-xl object-cover shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
