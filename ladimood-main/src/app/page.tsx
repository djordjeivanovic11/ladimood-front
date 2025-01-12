"use client";

import React, { useState, useEffect } from "react";
import Hero from "@/components/Frontpage/Hero";
import Categories from "@/components/Frontpage/Categories";
import ProductGrid from "@/components/Order/Shop/ProductGrid";
import Newsletter from "@/components/Frontpage/Newsletter";
import MontenegrinGallery from "@/components/Frontpage/MontenegrinGallery";
import SuggestionBox from "@/components/Frontpage/ShareIdeas";
import OurStory from "@/components/Frontpage/OurStory";
import ShopPrompt from "@/components/Frontpage/ShopPrompt";
import { getProducts, getCart, addToCart } from "@/api/account/axios";
import { Product, CartItem, Size } from "@/app/types/types";

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
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (
    product: Product,
    selectedColor: string,
    selectedSize: string
  ) => {
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
      console.error("Error adding item to cart:", error);
      setError("Failed to add item to cart. Please try again.");
    }
  };

  useEffect(() => {
    fetchProducts();

    if (typeof window !== "undefined") {
      const discountSignedUp = localStorage.getItem("discountSignedUp");
      if (!discountSignedUp) {
        setShowDiscountPopup(true);
      }
    }
  }, []);

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <>
      <head>
        <title>Ladimood | High-Quality Montenegrin-Inspired Clothing</title>
        <meta
          name="description"
          content="Ladimood brings you high-quality t-shirts and clothing inspired by Montenegrin culture. Wear your roots with pride and express your unique style."
        />
       <meta name="keywords" content="Ladimood, Montenegrin clothing, cultural t-shirts, high-quality t-shirts, unique designs, fashion Montenegro, Ladimood, Crnogorski brendovi, Balkanski brendovi, kul majice, balkanske izreke, balkanske fore, visokokvalitetne majice, jedinstveni dizajn, moda Crna Gora" />
        <meta name="author" content="Ladimood" />
        <meta property="og:title" content="Ladimood | High-Quality Montenegrin-Inspired Clothing" />
        <meta
          property="og:description"
          content="Discover Ladimood's unique Montenegrin-inspired clothing. Our t-shirts combine bold designs, cultural sayings, and premium materials."
        />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:url" content="https://www.ladimood.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ladimood | High-Quality Montenegrin-Inspired Clothing" />
        <meta
          name="twitter:description"
          content="Shop Ladimood for unique, high-quality t-shirts inspired by Montenegrin culture. Wear your roots and share your style."
        />
        <meta name="twitter:image" content="/images/og-image.jpg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.ladimood.com" />
      </head>
      <div className="bg-white">
        <div className="mb-16">
          <Hero />
        </div>

        {/* Our Story Section */}
        <div className="mb-16">
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
    </>
  );
};

export default Frontpage;
