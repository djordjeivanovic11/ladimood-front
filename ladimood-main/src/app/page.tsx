"use client";

import React, { useState, useEffect } from 'react';
import Hero from '@/components/Frontpage/Hero';
import Categories from "@/components/Frontpage/Categories";
import ProductGrid from "@/components/Order/Shop/ProductGrid";
import Newsletter from "@/components/Frontpage/Newsletter";
import MontenegrinGallery from '@/components/Frontpage/MontenegrinGallery';
import SuggestionBox from '@/components/Frontpage/ShareIdeas';

import OurStory from '@/components/Frontpage/OurStory';
import ShopPrompt from '@/components/Frontpage/ShopPrompt';
import { getProducts, getCart, addToCart } from '@/api/account/axios';
import { Product, CartItem, Size } from '@/app/types/types';

const Frontpage: React.FC = () => {
  const [showDiscountPopup, setShowDiscountPopup] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: Product, selectedColor: string, selectedSize: string) => {
    try {
      const newCartItem: CartItem = {
        id: product.id,
        product,
        quantity: 1,
        color: selectedColor,
        size: selectedSize as Size,
      };

      await addToCart(newCartItem);
      const updatedCart = await getCart();
      setCartItems(updatedCart.items);
      setIsCartOpen(true);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setError('Failed to add item to cart. Please try again.');
    }
  };

  useEffect(() => {
    fetchProducts();

    if (typeof window !== "undefined") {
      const discountSignedUp = localStorage.getItem('discountSignedUp');
      if (!discountSignedUp) {
        setShowDiscountPopup(true);
      }
    }
  }, []);

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="mt-4 mb-16"> {/* Increased space */}
        <Hero />
      </div>

         {/* Our Story Section */}
      <div className="mb-16"> {/* Increased space */}
        <OurStory />
      </div>

      <div className="mb-16"> 
        <MontenegrinGallery />
      </div>

      <div className="mb-16"> 
        <ShopPrompt />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader">Loading products...</div>
        </div>
      ) : (
        <div className="mb-16">
          <ProductGrid products={products} handleAddToCart={handleAddToCart} />
        </div>
      )}

      <div className="mb-16">
        <SuggestionBox />
      </div>

      <div className="mb-16"> 
        <Categories />
      </div>

      <div className="mt-16"> 
        <Newsletter />
      </div>
    </div>
  );
};

export default Frontpage;
