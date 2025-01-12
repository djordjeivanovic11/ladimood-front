"use client";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";

const Hero: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 2000 });
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden /* remove mt-4 or pt-4 if exists */">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/intro.MOV" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black bg-opacity-40 z-10">
        <h1
          className="text-white text-4xl md:text-6xl font-bold drop-shadow-lg"
          data-aos="fade-up"
        >
          KO LADI
          <br />
          ZLO NE MISLI
        </h1>
        <div className="mt-8" data-aos="fade-up" data-aos-delay="500">
          <Link href="/shop">
            <span className="bg-white text-[#0097B2] font-bold py-3 px-8 rounded-full transition-transform hover:scale-110 hover:bg-[#007A90] drop-shadow-md cursor-pointer">
              Shop Now
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
