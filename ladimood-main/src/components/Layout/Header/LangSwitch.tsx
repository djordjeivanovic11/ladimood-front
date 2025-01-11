"use client";
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Image from "next/image";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const languages = ['sr', 'en'];

  const otherLanguages = languages.filter((lang) => lang !== i18n.language);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownVisible(false);
    }, 200);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setDropdownVisible(false);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center p-2 rounded-lg" title={`Current language: ${i18n.language}`}>
        <Image
          src={`/images/lang/${i18n.language}.png`}
          alt={`${i18n.language} flag`}
          width={24}
          height={24}
          className="rounded-full object-cover"
        />
      </button>
      {dropdownVisible && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg z-50">
          {otherLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
            >
              <Image
                src={`/images/lang/${lang}.png`}
                alt={`${lang} flag`}
                width={20}
                height={20}
                className="rounded-full object-cover mr-2"
              />
              <span>{lang === 'sr' ? 'Montenegrin' : 'English'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
