'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const SuggestionBox: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-background to-muted px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-10 md:flex-row md:gap-16">
        {/* Right Side: Text and Button */}
        <div className="w-full p-6 text-center md:w-1/2 md:p-8 md:text-left">
          <h2 className="mb-6 text-4xl font-extrabold text-primary md:text-5xl">
            Imate cool ideju za majicu?
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Podijelite svoje ideje i pomozite nam da kreiramo jedinstvene majice koje slave
            crnogorsku kulturu i stil života. Radujemo se vašim prijedlozima!
          </p>
          <Link href="/contact" passHref>
            <Button size="lg" className="w-full rounded-full md:w-auto">
              Podijelite svoju ideju
            </Button>
          </Link>
        </div>

        {/* Left Side: Image */}
        <div className="relative w-full md:w-1/2">
          <div className="relative aspect-[4/5] md:aspect-square">
            <Image
              src="/images/slideshow/image6.jpeg"
              alt="Predložite svoj stil"
              fill
              className="rounded-lg object-cover shadow-2xl transition duration-300 hover:scale-105"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuggestionBox;
