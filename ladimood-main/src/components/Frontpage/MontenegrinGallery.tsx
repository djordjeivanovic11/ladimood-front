import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

const MontenegrinGallery: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;

    const scrollImages = () => {
      if (scrollContainer) {
        scrollAmount += 6;
        scrollContainer.scrollLeft = scrollAmount;
        if (
          scrollAmount >=
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        ) {
          scrollAmount = 0;
        }
      }
    };

    const intervalId = setInterval(scrollImages, 20);

    return () => clearInterval(intervalId);
  }, []);

  const images = [
    '/images/slideshow/image1.jpeg',
    '/images/slideshow/image2.jpeg',
    '/images/slideshow/image3.jpeg',
    '/images/slideshow/image4.jpeg',
    '/images/slideshow/image5.jpeg',
    '/images/slideshow/image7.jpeg',
    '/images/slideshow/image8.jpeg',
    '/images/slideshow/image9.jpeg',
    '/images/slideshow/image10.jpeg',
    '/images/slideshow/image11.jpeg',
    '/images/slideshow/image12.jpeg',
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-[#0097B2] text-center leading-tight mb-12 tracking-wide">
          Crafted in Montenegro
        </h2>
        <p className="text-md sm:text-lg md:text-2xl text-gray-600 text-center max-w-3xl mx-auto mb-12 leading-relaxed">
          Experience the essence of Montenegrin culture through our{' '}
          <span className="font-semibold text-[#0097B2]">high-quality t-shirts</span>. Each design is inspired by local
          sayings, bold humor, and cultural pride, telling a story that&apos;s authentically Montenegrin.
        </p>

        {/* Horizontal Scrollable Image Gallery */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex space-x-8 pb-8 overflow-x-auto scrollbar-hide"
          >
            {images.map((src, index) => (
              <div
                key={index}
                className="flex-none w-[400px] sm:w-[600px] md:w-[800px] relative overflow-hidden"
              >
                <Image
                  src={src}
                  alt={`Ladimood style party ${index + 1}`}
                  width={800}
                  height={800}
                  className="object-cover rounded-lg shadow-2xl"
                />
              </div>
            ))}
          </div>
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>

        {/* Call to Action Section */}
        <div className="text-center mt-16">
          <p className="text-md sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
            Every product is a testament to Montenegrin craftsmanship, combining{' '}
            <span className="font-semibold text-[#0097B2]">bold design</span> with cultural authenticity. Celebrate Montenegro, wear your
            roots, and stand out with every step.
          </p>
          <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[#0097B2] text-white font-bold text-md sm:text-lg rounded-full shadow-lg hover:bg-[#007B92] transition-transform transform hover:scale-105 duration-300">
            Shop the Collection
          </button>
        </div>
      </div>
    </section>
  );
};

export default MontenegrinGallery;
