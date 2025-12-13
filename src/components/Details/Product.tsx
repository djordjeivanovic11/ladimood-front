'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';
import { addToWishlist as addToWishlistAPI } from "@/api/account/axios";
import { Product as ProductType } from '@/app/types/types';

interface ProductProps {
  product: ProductType;
  availableColors: string[];
  availableSizes: string[];
  selectedColor: string;
  selectedSize: string;
  feedbackMessage?: string | null;
  onSelectColor: (color: string) => void;
  onSelectSize: (size: string) => void;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
}

const Product: React.FC<ProductProps> = ({
  product,
  availableColors,
  availableSizes,
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
  onAddToCart,
  onAddToWishlist,
}) => {
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (wishlistFeedback) {
      const timer = setTimeout(() => setWishlistFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [wishlistFeedback]);

  const handleAddToWishlist = async () => {
    if (!selectedColor || !selectedSize) {
      setFeedbackMessage("Please select a color and size before adding to the wishlist.");
      return;
    }
  
    try {
      await addToWishlistAPI({
        product_id: product.id,
        color: selectedColor,
        size: selectedSize,
      });
      setWishlistFeedback("Item successfully added to wishlist!");
    } catch (error: any) {
      if (error.message === "ItemAlreadyInWishlist") {
        setWishlistFeedback("Item is already in your wishlist!");
      } else {
        setWishlistFeedback("Failed to add item to wishlist. Try again later.");
      }
    }
  };
  
  
  return (
    <div className="productCard group bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
      <div className="relative w-full h-64">
        <Image
          src={product.image_url || '/images/default-product.jpg'}
          alt={product.name}
          fill
          className="object-contain transition-transform transform group-hover:scale-105 duration-300"
        />
      </div>
      <div className="p-6 text-center flex-grow">
        <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-[#0097B2]">
          {product.name}
        </h3>
        <p className="text-lg text-gray-600 mb-4">€{product.price.toFixed(2)}</p>
        <div className="flex justify-center items-center mb-4">
          {availableColors.map((color, index) => (
            <button
              key={index}
              title={`Odaberite boju ${color}`}
              onClick={() => onSelectColor(color)}
              className={`w-6 h-6 m-1 rounded-full border transition-transform transform hover:scale-110 focus:outline-none ${
                selectedColor === color
                  ? 'border-teal-300 border-2'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Odaberite boju ${color}`}
            />
          ))}
        </div>
        <div className="flex justify-center items-center space-x-2 mb-4">
          {availableSizes.map((size, index) => (
            <button
              key={index}
              onClick={() => onSelectSize(size)}
              className={`text-sm font-semibold px-3 py-1 border rounded-full cursor-pointer transition-all 
                ${
                  selectedSize === size
                    ? 'bg-[#0097B2] text-white border-[#0097B2]'
                    : 'border-gray-300 text-gray-800 hover:bg-gray-200'
                }`}
              aria-label={`Odaberite veličinu ${size}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center p-4">
        <button
          onClick={onAddToCart}
          className="flex-1 bg-[#0097B2] text-white text-lg font-semibold py-2 px-4 rounded-md transition-all mr-2 hover:bg-[#007B92] shadow-md hover:shadow-lg"
        >
          Dodaj u korpu
        </button>
        <button
          onClick={handleAddToWishlist}
          className="flex items-center justify-center bg-transparent border border-[#0097B2] text-[#0097B2] p-2 rounded-md transition-all hover:bg-[#0097B2] hover:text-white shadow-md hover:shadow-lg"
          title="Dodaj u listu želja"
          aria-label="Dodaj u listu želja"
        >
          <FaHeart className="text-lg" />
        </button>
      </div>
      {(feedbackMessage || wishlistFeedback) && (
        <div
        className={`p-2 mt-2 text-center text-sm rounded ${
          wishlistFeedback
            ? wishlistFeedback.includes('added') // Success
              ? 'bg-green-100 text-green-700'
              : wishlistFeedback.includes('already') // Already exists
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700' // Failure
            : feedbackMessage // Default feedback message
            ? 'bg-red-100 text-red-700'
            : ''
        }`}
      >
        {wishlistFeedback || feedbackMessage}
      </div>
      
      )}
    </div>
  );
};

export default Product;
