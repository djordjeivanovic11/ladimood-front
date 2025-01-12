import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SuggestionBox: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-white to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
        {/* Right Side: Text and Button */}
        <div className="w-full md:w-1/2 p-6 md:p-8 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0097B2] mb-6">
            Imate cool ideju za majicu?
          </h2>
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-8">
            Podijelite svoje ideje i pomozite nam da kreiramo jedinstvene dizajne majica koje slave crnogorsku kulturu i stil života. Radujemo se vašim prijedlozima!
          </p>
          <Link href="/contact" passHref>
            <button
              className="w-full md:w-auto px-8 py-4 bg-[#0097B2] text-white font-bold text-lg md:text-xl rounded-full shadow-lg hover:bg-[#007B92] transition transform hover:scale-105 duration-300 focus:outline-none focus:ring-2 focus:ring-[#007B92]"
            >
              Podijelite svoju ideju
            </button>
          </Link>
        </div>

        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 relative">
          <div className="relative h-0 pb-[125%] md:pb-[100%]">
            <Image
              src="/images/slideshow/image6.jpeg"
              alt="Predložite svoj stil"
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow-2xl transform hover:scale-105 transition duration-300"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuggestionBox;
