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
      console.error("Greška prilikom učitavanja proizvoda:", error);
      setError("Nije moguće učitati proizvode. Pokušajte ponovo kasnije.");
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
      console.error("Greška prilikom dodavanja proizvoda u korpu:", error);
      setError("Nije moguće dodati proizvod u korpu. Pokušajte ponovo.");
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
        <title>Ladimood | Visokokvalitetna odjeća inspirisana crnogorskom kulturom</title>
        <meta
          name="description"
          content="Ladimood vam donosi visokokvalitetne majice i odjeću inspirisanu crnogorskom kulturom. Nosi svoje korijene s ponosom i izrazi svoj jedinstveni stil."
        />
       <meta name="keywords" content="Ladimood, crnogorska odjeća, kulturne majice, visokokvalitetne majice, jedinstveni dizajn, moda Crna Gora, Ladimood, Crnogorski brendovi, Balkanski brendovi, kul majice, balkanske izreke, balkanske fore, visokokvalitetne majice, jedinstveni dizajn, moda Crna Gora" />
        <meta name="author" content="Ladimood" />
        <meta property="og:title" content="Ladimood | Visokokvalitetna odjeća inspirisana crnogorskom kulturom" />
        <meta
          property="og:description"
          content="Otkrijte jedinstvenu odjeću inspirisanu crnogorskom kulturom uz Ladimood. Naše majice spajaju odvažne dizajne, kulturne izreke i vrhunske materijale."
        />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:url" content="https://www.ladimood.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ladimood | Visokokvalitetna odjeća inspirisana crnogorskom kulturom" />
        <meta
          name="twitter:description"
          content="Kupujte kod Ladimooda jedinstvene, visokokvalitetne majice inspirisane crnogorskom kulturom. Nosi svoje korijene i dijeli svoj stil."
        />
        <meta name="twitter:image" content="/images/og-image.jpg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.ladimood.com" />
      </head>
      <div className="bg-white">
        <div className="mb-16">
          <Hero />
        </div>

        {/* Naša priča */}
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
            <div className="loader">Učitavanje proizvoda...</div>
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
