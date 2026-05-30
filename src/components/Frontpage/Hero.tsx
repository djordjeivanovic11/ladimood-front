'use client';
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Link from 'next/link';

const Hero: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 2000 });
  }, []);

  return (
    <div className="relative h-[calc(100svh-5rem)] min-h-[28rem] w-full overflow-hidden md:h-[calc(100dvh-6rem)]">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/videos/intro.MOV" type="video/mp4" />
        Vaš pregledač ne podržava video tag.
      </video>

      {/* Hero Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 px-4 text-center">
        <h1
          className="text-balance text-3xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-6xl"
          data-aos="fade-up"
        >
          LADIMOOD, VJERUJ MI
        </h1>
        <div className="mt-8" data-aos="fade-up" data-aos-delay="500">
          <Link href="/shop">
            <span className="inline-flex min-h-11 items-center rounded-full bg-white px-8 py-3 font-bold text-[#0097B2] transition-transform hover:scale-105 hover:bg-[#007A90] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 drop-shadow-md cursor-pointer">
              Shop now
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
