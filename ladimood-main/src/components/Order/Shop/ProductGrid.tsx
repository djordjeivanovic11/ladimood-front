'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaHeart } from 'react-icons/fa';
import {
  Product as ProductType,
  ProductGridProps,
  WishlistItem,
  Size,
  CartItem,
} from '@/app/types/types';
import {
  addToWishlist,
  getCurrentUser,
  addToCart,
  getCart,
} from '@/api/account/axios';
import CartSidebar from '@/components/Order/Cart/CartSidebar';

import Product from '@/components/Details/Product';

const availableColors = ['#000000', '#FFFFFF']; 
const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']; 

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [productId: number]: { color: string; size: string };
  }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [cartItems, setCartItems] = useState<CartItem[]>([]); 
  const [feedbackMessages, setFeedbackMessages] = useState<{ [productId: number]: string | null }>({}); 
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      getCurrentUser()
        .then((user) => {
          if (user) {
            setIsLoggedIn(true);
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
        });
    }
  }, []);

  const handleSelectColor = (productId: number, color: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        color,
      },
    }));
  };

  const handleSelectSize = (productId: number, size: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        size,
      },
    }));
  };

  const handleAddToWishlist = async (product: ProductType) => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    const { id, name } = product;
    const selectedColor = selectedAttributes[id]?.color || availableColors[0];
    const selectedSize = selectedAttributes[id]?.size || availableSizes[0];

    const wishlistItem: WishlistItem = {
      id,
      product,
      color: selectedColor,
      size: selectedSize as Size,
    };

    try {
      await addToWishlist(wishlistItem);
      setFeedbackMessages((prev) => ({
        ...prev,
        [id]: `"${name}" has been added to your wishlist!`,
      }));
      setTimeout(() => {
        setFeedbackMessages((prev) => ({
          ...prev,
          [id]: null,
        }));
      }, 3000);
    } catch (error: any) {
      console.error('Error adding item to wishlist:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to add item to wishlist.';
      setFeedbackMessages((prev) => ({
        ...prev,
        [id]: errorMessage,
      }));
      setTimeout(() => {
        setFeedbackMessages((prev) => ({
          ...prev,
          [id]: null,
        }));
      }, 3000);
    }
  };

  const handleAddToCartWithLoginCheck = async (product: ProductType) => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    const selectedColor = selectedAttributes[product.id]?.color || availableColors[0];
    const selectedSize = selectedAttributes[product.id]?.size || availableSizes[0];

    try {
      const newCartItem: CartItem = {
        id: product.id,
        product,
        quantity: 1,
        color: selectedColor,
        size: selectedSize as Size,
      };

      // Add item to cart
      await addToCart(newCartItem);

      // Fetch updated cart to show in sidebar
      const updatedCart = await getCart();
      setCartItems(updatedCart.items);

      // Open cart sidebar
      setIsCartOpen(true);

      // Show feedback
      setFeedbackMessages((prev) => ({
        ...prev,
        [product.id]: 'Item added to cart!',
      }));
      setTimeout(() => {
        setFeedbackMessages((prev) => ({
          ...prev,
          [product.id]: null,
        }));
      }, 3000);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setFeedbackMessages((prev) => ({
        ...prev,
        [product.id]: 'Failed to add item to cart (it may already be in the cart).',
      }));
      setTimeout(() => {
        setFeedbackMessages((prev) => ({
          ...prev,
          [product.id]: null,
        }));
      }, 3000);
    }
  };

  return (
    <div className="mt-10">
      {/* Grid of Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 p-8">
        {products.map((product) => {
          const { id } = product;
          const selectedColor = selectedAttributes[id]?.color || availableColors[0];
          const selectedSize = selectedAttributes[id]?.size || availableSizes[0];

          return (
            <Product
              key={id}
              product={product}
              availableColors={availableColors}
              availableSizes={availableSizes}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              feedbackMessage={feedbackMessages[id] || null}
              onSelectColor={(color) => handleSelectColor(id, color)}
              onSelectSize={(size) => handleSelectSize(id, size)}
              onAddToCart={() => handleAddToCartWithLoginCheck(product)}
              onAddToWishlist={() => handleAddToWishlist(product)}
            />
          );
        })}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        closeCart={() => setIsCartOpen(false)}
        cartItems={cartItems}
        removeFromCart={() => {}} 
        updateQuantity={() => {}}
      />
    </div>
  );
};

export default ProductGrid;
