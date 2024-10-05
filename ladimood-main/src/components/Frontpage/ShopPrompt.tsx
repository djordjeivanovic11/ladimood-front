import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ShopPrompt = () => {
  return (
    <div className="relative bg-gray-50 text-white py-24 px-8 rounded-lg shadow-xl text-center mb-24 max-w-6xl mx-auto">
      {/* Logo container */}
      <div className="absolute top-4 right-4 bg-white rounded-full">
        <Image 
          src="/images/LADIMOOD.svg"  
          alt="Logo"
          width={100}
          height={100}
          className="rounded-full"
        />
      </div>

      <h2 className="text-4xl text-[#0097B2] md:text-6xl font-extrabold leading-tight mb-6 tracking-wide">
        Wear Your Culture, Share Your Style
      </h2>
      <p className="text-lg text-[#0097B2] md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
        Our t-shirts don’t just cover your back—they tell a story! With local sayings and cool, catchy designs,
        you’re not just wearing a tee, you’re wearing your roots. Whether you&lsquo;re looking for a unique gift or something
        bold for your wardrobe, we&lsquo;ve got you covered!
      </p>
      <div className="mt-12">
        <Link 
          href="/shop"
          className="bg-white text-[#0097B2] font-bold py-4 px-10 rounded-full hover:bg-gray-100 shadow-lg hover:shadow-2xl transition duration-300"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
};

export default ShopPrompt;

