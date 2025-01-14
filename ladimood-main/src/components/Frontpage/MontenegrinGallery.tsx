import React, { useEffect, useRef } from "react";
import Image from "next/image";

const MontenegrinGallery: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;
    let isHovering = false;

    const scrollGallery = () => {
      if (scrollContainer && !isHovering) {
        scrollAmount += 2; // Adjusted scroll speed for faster scrolling
        if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollAmount = 0; // Reset scroll position for infinite loop
        }
        scrollContainer.scrollLeft = scrollAmount;
      }
      requestAnimationFrame(scrollGallery); // Continue scrolling
    };

    const handleMouseEnter = () => (isHovering = true);
    const handleMouseLeave = () => (isHovering = false);

    if (scrollContainer) {
      scrollContainer.addEventListener("mouseenter", handleMouseEnter);
      scrollContainer.addEventListener("mouseleave", handleMouseLeave);
    }

    const animationId = requestAnimationFrame(scrollGallery);

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
        scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(animationId);
    };
  }, []);

  const images = [
    "/images/slideshow/image1.jpeg",
    "/images/slideshow/image2.jpeg",
    "/images/slideshow/image3.jpeg",
    "/images/slideshow/image4.jpeg",
    "/images/slideshow/image5.jpeg",
    "/images/slideshow/image7.jpeg",
    "/images/slideshow/image8.jpeg",
    "/images/slideshow/image9.jpeg",
    "/images/slideshow/image10.jpeg",
    "/images/slideshow/image11.jpeg",
    "/images/slideshow/image12.jpeg",
  ];

  return (
    <div className="relative bg-gray-50">
      <div className="text-center py-8 px-4 sm:py-12 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0097B2] leading-tight mb-4 sm:mb-6">
          Made in Montenegro
        </h1>
        <p className="text-sm sm:text-lg md:text-xl text-gray-700 text-center max-w-3xl mx-auto mb-6 leading-relaxed">
          Doživite srce crnogorske kulture kroz našu{" "}
          <span className="font-semibold text-[#0097B2]">jedinstvenu kolekciju majica</span>. 
          Ladimood je brend posvećen slavljenju umjetnosti laganog življenja—uživanja u malim trenucima, 
          šoljici kafe u ruci, pod toplim crnogorskim suncem. Zaboravite na žurbu i stres; prihvatite opuštanje i osmijeh.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-4 sm:space-x-6 md:space-x-8 pb-8 sm:pb-12 overflow-x-auto scrollbar-hide px-4"
      >
        {images.map((src, index) => (
          <div
            key={index}
            className="flex-none w-[200px] sm:w-[300px] md:w-[450px] lg:w-[600px] relative overflow-hidden"
          >
            <Image
              src={src}
              alt={`Ladimood stil zabava ${index + 1}`}
              width={1000}
              height={1000}
              className="object-cover rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300"
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
  );
};

export default MontenegrinGallery;
