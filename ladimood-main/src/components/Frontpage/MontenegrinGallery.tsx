import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

const MontenegrinGallery: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Debug auto-scroll logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;

    const scrollImages = () => {
      if (scrollContainer) {
        scrollAmount += 3; // Speed of scrolling
        scrollContainer.scrollLeft = scrollAmount;

        if (
          scrollAmount >=
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        ) {
          scrollAmount = 0;
        }
      }
    };

    const intervalId = setInterval(scrollImages, 30);
    return () => clearInterval(intervalId);
  }, []);

  // Load one image at a time for debugging
  const images = [
    '/images/slide/image1.webp', // Step 1: Test with this image only
    '/images/slide/image2.webp', // Step 2: Uncomment and test this
    '/images/slide/image3.webp', // Step 3: Uncomment and test this
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
          sayings, bold humor, and cultural pride, telling a story that’s authentically Montenegrin.
        </p>

        {/* Horizontal Scrollable Image Gallery */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex space-x-8 pb-8 overflow-x-auto scrollbar-hide"
          >
            {images.slice(0, 1).map((src, index) => ( // Only load the first image for now
              <div
                key={index}
                className="flex-none w-[300px] sm:w-[450px] md:w-[600px] relative overflow-hidden"
              >
                <Image
                  src={src}
                  alt={`Montenegrin culture ${index + 1}`}
                  width={600}
                  height={600}
                  className="object-cover rounded-lg shadow-xl"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="text-center mt-16">
          <p className="text-md sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
            Every product is a testament to Montenegrin craftsmanship, combining{' '}
            <span className="font-semibold text-[#0097B2]">bold design</span> with cultural authenticity. Celebrate Montenegro, wear your
            roots, and stand out with every step.
          </p>
          <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[#0097B2] text-white font-bold text-md sm:text-lg rounded-full shadow-md hover:bg-[#007B92] transition-colors duration-300">
            Shop the Collection
          </button>
        </div>
      </div>
    </section>
  );
};

export default MontenegrinGallery;
