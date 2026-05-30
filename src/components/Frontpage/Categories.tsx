'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCategoriesQuery } from '@/hooks/queries/useProducts';
import { IMAGE_SIZES } from '@/lib/image';

const fallbackCards = [
  '/images/categories/hoodies.png',
  '/images/categories/tees.png',
  '/images/categories/accessories.png',
];

const CategoryComponent = () => {
  const { data: categories = [] } = useCategoriesQuery();
  const dynamicCards =
    categories.length > 0
      ? categories.slice(0, 3).map((category, idx) => ({
          title: category.name.toUpperCase(),
          subtitle: category.description || 'Istraži proizvode iz ove kategorije',
          imageSrc: category.image_url?.trim() || fallbackCards[idx % fallbackCards.length],
          link: `/shop?category_id=${category.id}`,
        }))
      : fallbackCards.map((img, idx) => ({
          title: `KATEGORIJA ${idx + 1}`,
          subtitle: 'Istraži proizvode',
          imageSrc: img,
          link: '/shop',
        }));

  return (
    <div className="bg-background py-12 sm:py-16">
      <h1 className="mb-10 text-center text-3xl font-bold leading-tight text-primary sm:mb-16 sm:text-4xl md:text-6xl">
        Istraži kategorije
      </h1>
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-10 px-4 md:grid-cols-3 md:px-8">
        {dynamicCards.map((category, index) => (
          <Link href={category.link} key={`${category.title}-${index}`}>
            <div
              className={`group relative h-[280px] cursor-pointer overflow-hidden rounded-xl sm:h-[340px] md:h-[420px] ${
                index % 2 === 0 ? 'bg-background shadow-2xl' : 'bg-muted shadow-lg'
              } transform transition-transform duration-300 hover:scale-[1.02]`}
            >
              <Image
                src={category.imageSrc}
                alt={category.title}
                fill
                sizes={IMAGE_SIZES.categoryCard}
                className="rounded-xl object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-5 text-white opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                <h2 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">
                  {category.title}
                </h2>
                <p className="mt-3 text-center text-sm sm:text-base md:text-lg">
                  {category.subtitle}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-primary to-transparent transition-all duration-300 group-hover:from-primary/80" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryComponent;
