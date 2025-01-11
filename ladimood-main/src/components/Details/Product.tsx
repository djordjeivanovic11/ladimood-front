'use client';

import React from 'react';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';
import { Product as ProductType, Size } from '@/app/types/types';

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
  feedbackMessage,
  onSelectColor,
  onSelectSize,
  onAddToCart,
  onAddToWishlist,
}) => {
  return (
    <div className="productCard group bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative w-full h-64">
        <Image
          src={product.image_url || '/images/default-product.jpg'}
          alt={product.name}
          fill
          className="object-contain transition-transform transform group-hover:scale-105 duration-300"
        />
      </div>

      {/* Product Details */}
      <div className="p-6 text-center flex-grow">
        <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-[#0097B2]">
          {product.name}
        </h3>
        <p className="text-lg text-gray-600 mb-2">€{product.price.toFixed(2)}</p>

        {/* Color Options */}
        {availableColors.map((color, index) => (
          <button
            key={index}
            title={`Select color ${color}`}
            onClick={() => onSelectColor(color)}
            className={`w-8 h-8 m-1 rounded-full border ${
              selectedColor === color
                ? 'border-teal-300 border-4 shadow-lg'
                : 'border-gray-300 border-2'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}



        {/* Size Options */}
        <div className="flex justify-center items-center space-x-2 mb-4">
          {availableSizes.map((size, index) => (
            <button
              key={index}
              onClick={() => onSelectSize(size)}
              className={`text-sm font-semibold px-3 py-2 border rounded-full cursor-pointer transition-all 
                ${
                  selectedSize === size
                    ? 'bg-[#0097B2] text-white border-[#0097B2]'
                    : 'border-gray-300 text-gray-800 hover:bg-gray-200'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons (Add to Cart & Add to Wishlist) */}
      <div className="flex justify-between items-center p-4">
        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          className="flex-1 bg-[#0097B2] text-white text-lg font-semibold py-2 px-4 rounded-md transition-all mr-2"
        >
          Add to Cart
        </button>

        {/* Add to Wishlist Button */}
        <button
          onClick={onAddToWishlist}
          className="flex items-center justify-center bg-transparent border border-[#0097B2] text-[#0097B2] p-2 rounded-md transition-all hover:bg-[#0097B2] hover:text-white"
          title="Add to Wishlist"
        >
          <FaHeart className="text-lg" />
        </button>
      </div>

      {/* Feedback Message under Product Card */}
      {feedbackMessage && (
        <div className="p-2 mt-2 text-center text-sm rounded bg-green-100 text-green-700">
          {feedbackMessage}
        </div>
      )}
    </div>
  );
};

export default Product;
