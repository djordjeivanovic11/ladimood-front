import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ShopPrompt = () => {
  return (
    <div className="relative bg-white text-gray-800 py-24 px-8 rounded-lg border border-[#0097B2] text-center mb-24 max-w-6xl mx-auto overflow-hidden shadow-lg">
      {/* Logo */}
      <div className="relative z-10 mx-auto mb-8">
        <Image 
          src="/images/LADIMOOD.svg"  
          alt="Ladimood Logo"
          width={120}
          height={120}
          className="rounded-full shadow-md"
        />
      </div>

      {/* Heading */}
      <h2 className="relative z-10 text-4xl text-[#0097B2] md:text-5xl font-extrabold leading-tight mb-6 tracking-wide">
        Živi lagano
      </h2>
      
      {/* Description */}
      <p className="relative z-10 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed mb-6 text-gray-700">
        Ladimood nije za one koji jure kroz život. Ovo je za ekipu koja zna 
        kako se uživa—kafica, sunce, dobra ekipa, i naravno, savršena majica. 
        Ako nosiš Ladimood, zna se: opuštenost je tvoj stil, a osmijeh tvoj potpis.
      </p>
      <p className="relative z-10 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed mb-6 text-gray-700">
        Ovo nije moda koja se trudi. Ovo je moda koja prirodno ide uz tebe. 
        Ako znaš šta znači &quot;meračenje&quot;, ovo je za tebe.
      </p>

      {/* Call-to-Action Button */}
      <div className="relative z-10 mt-8">
        <Link 
          href="/shop"
          className="inline-block bg-[#0097B2] text-white font-bold py-4 px-12 rounded-full shadow-lg hover:bg-[#007B92] hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          Pogledaj kolekciju
        </Link>
      </div>

      {/* Decorative Thin Border & Accents */}
      <div className="absolute inset-0 rounded-lg pointer-events-none">
        <div className="absolute inset-0 border-[2px] rounded-lg border-[#0097B2] opacity-10"></div>
        <div className="absolute -inset-2 rounded-lg border-[1px] border-[#005F73] opacity-5"></div>
      </div>

      {/* Decorative Bottom Accent */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-2 bg-gradient-to-r from-[#0097B2] to-[#005F73] rounded-full blur-xl opacity-50"></div>
    </div>
  );
};

export default ShopPrompt;
