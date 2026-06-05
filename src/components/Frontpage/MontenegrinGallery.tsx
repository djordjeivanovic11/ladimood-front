'use client';

import React from 'react';
import { AutoScrollingGallery } from '@/components/Frontpage/AutoScrollingGallery';

const MontenegrinGallery: React.FC = () => {
  const images = [
    '/images/slideshow/image1.jpeg',
    '/images/slideshow/image2.jpeg',
    '/images/slideshow/image3.jpeg',
    '/images/slideshow/image4.jpeg',
    '/images/slideshow/image5.jpeg',
    '/images/slideshow/image6.jpeg',
    '/images/slideshow/image7.jpeg',
    '/images/slideshow/image8.jpeg',
    '/images/slideshow/image9.jpeg',
  ].map((src, index) => ({
    src,
    alt: `Ladimood stil zabava ${index + 1}`,
    key: src,
  }));

  return (
    <div className="relative bg-muted/50">
      <div className="px-4 py-8 text-center sm:px-6 sm:py-12">
        <h1 className="mb-4 text-3xl font-extrabold leading-tight text-primary sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
          Made in Montenegro
        </h1>
        <p className="mx-auto mb-6 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
          Ladimood je brend posvećen slavljenju umjetnosti laganog življenja, uživanja u malim
          trenucima, šoljici kafe i dobrom društvu pod toplim crnogorskim suncem. Zaboravite na
          žurbu i stres, prihvatite opuštanje, osmijeh i ladimood.
        </p>
      </div>

      <AutoScrollingGallery images={images} scrollSpeed={2} />
    </div>
  );
};

export default MontenegrinGallery;
