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
    <div className="bg-white py-16">
      <h1 className="text-center text-5xl md:text-6xl font-bold text-[#0097B2] leading-tight mb-16">
        Istraži kategorije
      </h1>
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-4 md:px-8">
        {categories.map((category, index) => (
          <Link href={category.link} key={category.title}>
            <div
              className={`relative group cursor-pointer rounded-xl overflow-hidden h-[450px] 
              ${index % 2 === 0 ? 'bg-white shadow-2xl' : 'bg-[#f1f5f9] shadow-lg'} 
              transform transition-transform duration-300 group-hover:scale-[1.05]`}
            >
              <Image
                src={category.imageSrc}
                alt={category.title}
                layout="fill"
                objectFit="cover"
                className="rounded-xl opacity-90 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h2 className="text-4xl font-bold md:text-5xl">{category.title}</h2>
                <p className="text-lg md:text-xl mt-4 text-center">{category.subtitle}</p>
              </div>
              <div
                className={`absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-[#0097B2] to-transparent group-hover:from-[#007A90] transition-all duration-300`}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryComponent;
