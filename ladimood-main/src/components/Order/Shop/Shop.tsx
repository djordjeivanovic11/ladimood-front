"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ProductFilter from './ProductFilter';
import ProductGrid from './ProductGrid';
import CartSidebar from '@/components/Order/Cart/CartSidebar';
import { Product, CartItem, SizeEnum } from '@/app/types/types';
import { getCurrentUser, getCart, addToCart, getProducts } from '@/api/account/axios';

const Shop: React.FC = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [showNewestArrivals, setShowNewestArrivals] = useState<boolean>(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [categoryFromQuery, setCategoryFromQuery] = useState<string | null>(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      getCurrentUser()
        .then((user) => {
          if (!user) {
            setIsLoggedIn(false);
            router.push('/auth/login');
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
        });
    }
  }, [router]);



  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getProducts(); // Axios function to get products
        setProducts(products); // Set raw products here
        setFilteredProducts(products); // Initially, show all products
  
        // Apply filters if category is set from URL
        const category = getCategoryFromURL();
        if (category) {
          setCategoryFromQuery(category);
          setSelectedCategory([category.charAt(0).toUpperCase() + category.slice(1)]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProducts();
  }, []);

  // Function to extract category from the URL query parameters
  const getCategoryFromURL = () => {
    if (typeof window !== 'undefined') {
      // Only execute on client side
      const params = new URLSearchParams(window.location.search);
      return params.get('category');
    }
    return null;
  };

  // Filter products based on the selected criteria
  const filterProducts = useCallback(() => {
    if (!products.length) return []; // Return early if no products are loaded

    let filtered = [...products];

    // Apply category filter
    if (selectedCategory.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategory.some((category) => product.category.name.includes(category))
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= selectedPriceRange[0] && product.price <= selectedPriceRange[1]
    );

    // Apply sorting
    if (sortBy === 'priceLowToHigh') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHighToLow') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered); // Update filtered products
  }, [products, selectedCategory, selectedPriceRange, sortBy]);

  // Apply the filters after the products are fetched or filter criteria change
  useEffect(() => {
    if (!isLoading) {
      filterProducts();
    }
  }, [filterProducts, isLoading]);

  // Handle adding item to cart
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
        size: selectedSize as SizeEnum,
      };

      // Send the new cart item to the backend
      await addToCart(newCartItem);

      // Fetch the updated cart from the backend and set the cart items
      const updatedCart = await getCart();
      setCartItems(updatedCart.items);

      // Open the cart sidebar
      setIsCartOpen(true);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  // Remove item from cart
  const removeFromCart = (id: number, selectedColor: string, selectedSize: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.id === id && item.color === selectedColor && item.size === selectedSize)
      )
    );
  };

  // Update quantity of items in cart
  const updateQuantity = (
    id: number,
    selectedColor: string,
    selectedSize: string,
    quantity: number
  ) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.color === selectedColor && item.size === selectedSize
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col md:flex-row bg-white">
        {/* Filters */}
        <div className="md:w-1/4">
          <ProductFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            showNewestArrivals={showNewestArrivals}
            setShowNewestArrivals={setShowNewestArrivals}
            selectedPriceRange={selectedPriceRange}
            setSelectedPriceRange={setSelectedPriceRange}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {/* Products */}
        <div className="flex-1 bg-white">
          {isLoading ? (
            <div className="flex justify-center items-center h-screen">
              <div className="loader">Loading...</div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} handleAddToCart={handleAddToCart} />
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No products found for the selected filters.</p>
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <CartSidebar
          isOpen={isCartOpen}
          closeCart={() => setIsCartOpen(false)}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
        />
      </div>
    </Suspense>
  );
};

export default Shop;
