'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const categories = [
  {
    title: 'DUKSERICE',
    subtitle: ' PULLOVER HOODIE | FULL ZIP HOODIE| CREWNECK',
    imageSrc: '/images/categories/hoodies.png',
    link: '/shop?category=hoodies',
  },
  {
    title: 'MAJICE',
    subtitle: 'SLIM FIT| OVERSIZE | KLASIČNE',
    imageSrc: '/images/categories/tees.png',
    link: '/shop?category=T-Shirts',
  },
  {
    title: 'ACCESSORIES',
    subtitle: 'KAPE | NARUKVICE | TORBE | ČARAPE',
    imageSrc: '/images/categories/accessories.png',
    link: '/shop?category=accessories',
  },
];

const CategoryComponent = () => {
  return (
    <div className="bg-background py-16">
      <h1 className="mb-16 text-center text-5xl font-bold leading-tight text-primary md:text-6xl">
        Istraži kategorije
      </h1>
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-10 px-4 md:grid-cols-3 md:px-8">
        {categories.map((category, index) => (
          <Link href={category.link} key={category.title}>
            <div
              className={`group relative h-[450px] cursor-pointer overflow-hidden rounded-xl ${
                index % 2 === 0 ? 'bg-background shadow-2xl' : 'bg-muted shadow-lg'
              } transform transition-transform duration-300 group-hover:scale-[1.05]`}
            >
              <Image
                src={category.imageSrc}
                alt={category.title}
                fill
                className="rounded-xl object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h2 className="text-4xl font-bold md:text-5xl">{category.title}</h2>
                <p className="mt-4 text-center text-lg md:text-xl">{category.subtitle}</p>
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
