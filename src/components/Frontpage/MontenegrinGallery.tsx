'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

const MontenegrinGallery: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;
    let isHovering = false;

    const scrollGallery = () => {
      if (scrollContainer && !isHovering) {
        scrollAmount += 2;
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

    if (scrollContainer) {
      scrollContainer.addEventListener('mouseenter', handleMouseEnter);
      scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    }

    const animationId = requestAnimationFrame(scrollGallery);

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationId);
    };
  }, []);

  const images = [
    '/images/slideshow/image1.jpeg',
    '/images/slideshow/image2.jpeg',
    '/images/slideshow/image3.jpeg',
    '/images/slideshow/image4.jpeg',
    '/images/slideshow/image5.jpeg',
    '/images/slideshow/image7.jpeg',
    '/images/slideshow/image8.jpeg',
    '/images/slideshow/image9.jpeg',
    '/images/slideshow/image10.jpeg',
    '/images/slideshow/image11.jpeg',
    '/images/slideshow/image12.jpeg',
  ];

  return (
    <div className="relative bg-muted/50">
      <div className="px-4 py-8 text-center sm:px-6 sm:py-12">
        <h1 className="mb-4 text-3xl font-extrabold leading-tight text-primary sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
          Made in Montenegro
        </h1>
        <p className="mx-auto mb-6 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
          Doživite srce crnogorske kulture kroz našu{' '}
          <span className="font-semibold text-primary">jedinstvenu kolekciju majica</span>. Ladimood
          je brend posvećen slavljenju umjetnosti laganog življenja—uživanja u malim trenucima,
          šoljici kafe u ruci, pod toplim crnogorskim suncem. Zaboravite na žurbu i stres;
          prihvatite opuštanje i osmijeh.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex space-x-4 overflow-x-auto px-4 pb-8 sm:space-x-6 sm:pb-12 md:space-x-8"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {images.map((src, index) => (
          <div
            key={index}
            className="relative w-[200px] flex-none overflow-hidden sm:w-[300px] md:w-[450px] lg:w-[600px]"
          >
            <Image
              src={src}
              alt={`Ladimood stil zabava ${index + 1}`}
              width={1000}
              height={1000}
              className="transform rounded-xl object-cover shadow-lg transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MontenegrinGallery;
