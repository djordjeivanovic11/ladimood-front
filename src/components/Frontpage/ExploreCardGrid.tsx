'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IMAGE_SIZES } from '@/lib/image';

export interface ExploreCard {
  title: string;
  subtitle: string;
  imageSrc: string;
  link: string;
}

interface ExploreCardGridProps {
  heading?: string;
  cards: ExploreCard[];
}

const ExploreCardGrid: React.FC<ExploreCardGridProps> = ({ heading, cards }) => {
  return (
    <div className="bg-background py-4 sm:py-6">
      {heading ? (
        <h1 className="mb-6 text-center text-3xl font-bold leading-tight text-primary sm:mb-8 sm:text-4xl md:text-6xl">
          {heading}
        </h1>
      ) : null}
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 md:px-8">
        {cards.map((card, index) => (
          <Link href={card.link} key={`${card.title}-${index}`}>
            <div
              className={`group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-xl ${
                index % 2 === 0 ? 'bg-background shadow-lg' : 'bg-muted shadow-md'
              } transform transition-transform duration-300 hover:scale-[1.01]`}
            >
              <Image
                src={card.imageSrc}
                alt={card.title}
                fill
                sizes={IMAGE_SIZES.categoryCard}
                className="rounded-xl object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-5 text-white opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                <h2 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">
                  {card.title}
                </h2>
                <p className="mt-3 text-center text-sm sm:text-base md:text-lg">{card.subtitle}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-primary to-transparent transition-all duration-300 group-hover:from-primary/80" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ExploreCardGrid;
