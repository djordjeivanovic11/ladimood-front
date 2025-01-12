import React from 'react';
import Image from 'next/image';

const AboutUs: React.FC = () => {
  return (
    <section className="min-h-screen bg-white flex items-center justify-center py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Section - Big Bold Text */}
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#0097B2] leading-tight">
            LADIMOOD®  
            <br />  
            BREND SA RITMOM I ENERGIJOM  
            <br />
            STVARA EMOCIJU U SVAKOM PROIZVODU
          </h1>
        </div>

        {/* Right Section - Image and Interactive Elements */}
        <div className="flex flex-col justify-center items-center space-y-6">
          {/* Image */}
          <Image
            src="/images/LADIMOOD.svg" 
            alt="Ladimood Inspiracija"
            width={500}
            height={500}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />

          {/* Optional Video/Additional Text */}
          <div className="text-gray-700 text-lg">
            <p>
              U Ladimoodu težimo da isporučimo proizvode koji odražavaju vaš način života—podstičući pozitivne emocije i stvarajući jedinstven stil. Otkrijte šta nas čini posebnim.
            </p>

            {/* Example button for further interaction */}
            <button className="mt-4 px-6 py-2 bg-[#0097B2] text-white font-semibold rounded-lg hover:bg-[#007B92] transition">
              Pogledajte naše proizvode
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
