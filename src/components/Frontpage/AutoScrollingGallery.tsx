'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { IMAGE_SIZES, shouldUnoptimizeImage } from '@/lib/image';

export type AutoScrollingGalleryImage = {
  src: string;
  alt: string;
  key?: string | number;
};

type AutoScrollingGalleryProps = {
  images: AutoScrollingGalleryImage[];
  scrollSpeed?: number;
  className?: string;
};

export function AutoScrollingGallery({
  images,
  scrollSpeed = 2,
  className = '',
}: AutoScrollingGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || images.length === 0) return;

    let scrollAmount = 0;
    let isHovering = false;

    const scrollGallery = () => {
      if (scrollContainer && !isHovering) {
        scrollAmount += scrollSpeed;
        if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollAmount = 0;
        }
        scrollContainer.scrollLeft = scrollAmount;
      }
      requestAnimationFrame(scrollGallery);
    };

    const handleMouseEnter = () => {
      isHovering = true;
    };
    const handleMouseLeave = () => {
      isHovering = false;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    const animationId = requestAnimationFrame(scrollGallery);

    return () => {
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [images.length, scrollSpeed]);

  if (images.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className={`scrollbar-hide flex space-x-4 overflow-x-auto px-4 pb-8 sm:space-x-6 sm:pb-12 md:space-x-8 ${className}`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {images.map((image, index) => (
        <div
          key={image.key ?? `${image.src}-${index}`}
          className="relative w-[200px] flex-none overflow-hidden sm:w-[300px] md:w-[450px] lg:w-[600px]"
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={1000}
            height={1000}
            sizes={IMAGE_SIZES.gallerySlide}
            loading="lazy"
            unoptimized={shouldUnoptimizeImage(image.src)}
            className="transform rounded-xl object-cover shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
