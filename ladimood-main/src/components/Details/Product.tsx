import React, { useState } from 'react';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';
import { WishlistItem, SizeEnum, CartItem } from '@/app/types/types';
import { addToWishlist, addToCart } from '@/api/account/axios';

interface ProductComponentProps {
  product: any; // Change this to 'any' to allow for flexible product structures
}

const availableColors = ['#000000']; // example colors
const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']; // example sizes

const ProductComponent: React.FC<ProductComponentProps> = ({ product }) => {
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0]);

  // Helper function to safely access nested properties
  const getProductProperty = (prop: string) => {
    if (!product) return undefined;
    return product.fields && product.fields[prop] !== undefined
      ? product.fields[prop]
      : product[prop];
  };

  const handleAddToWishlist = async () => {
    const wishlistItem: WishlistItem = {
      id: getProductProperty('id'),
      product,
      color: selectedColor,
      size: selectedSize as SizeEnum,
    };

    try {
      await addToWishlist(wishlistItem);
      alert('Item added to wishlist!');
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
      alert('Failed to add item to wishlist.');
    }
  };

  const handleAddToCart = async () => {
    const cartItem: CartItem = {
      id: getProductProperty('id'),
      product,
      quantity: 1,
      color: selectedColor,
      size: selectedSize as SizeEnum,
    };

    try {
      await addToCart(cartItem);
      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      alert('Failed to add item to cart.');
    }
  };

  return (
    <div className="group bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative w-full h-64">
        <Image
          src={getProductProperty('image_url') || '/images/default-product.jpg'}
          alt={getProductProperty('name') || 'Product Image'}
          layout="fill"
          objectFit="contain"
          className="transition-transform transform group-hover:scale-105 duration-300"
        />
      </div>

      {/* Product Details */}
      <div className="p-6 text-center">
        <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-[#0097B2]">
          {getProductProperty('name') || 'Unnamed Product'}
        </h3>
        <p className="text-lg text-gray-600 mb-2">
          €{(getProductProperty('price') || 0).toFixed(2)}
        </p>

        {/* Color Options */}
        <div className="flex justify-center items-center space-x-2 mb-4">
          {availableColors.map((color, index) => (
            <button
              key={index}
              style={{ backgroundColor: color }}
              className={`w-8 h-8 rounded-full border transition-colors ${
                selectedColor === color
                  ? 'border-teal-300 border-4 shadow-lg'
                  : 'border-gray-300 border-2'
              } hover:border-teal-300`}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>

        {/* Size Options */}
        <div className="flex justify-center items-center space-x-2 mb-4">
          {availableSizes.map((size, index) => (
            <button
              key={index}
              onClick={() => setSelectedSize(size)}
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

        {/* Buttons (Add to Cart & Add to Wishlist) */}
        <div className="flex justify-between items-center mt-3">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-[#0097B2] text-white text-lg font-semibold py-2 px-4 rounded-md transition-all mr-2"
          >
            Add to Cart
          </button>

          {/* Add to Wishlist Button */}
          <button
            onClick={handleAddToWishlist}
            className="flex items-center justify-center bg-transparent border border-[#0097B2] text-[#0097B2] p-2 rounded-md transition-all hover:bg-[#0097B2] hover:text-white"
          >
            <FaHeart className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductComponent;