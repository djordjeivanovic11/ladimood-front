'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product as ProductType, Size, AddWishlistItemRequest } from '@/app/types/types';
import { addToWishlist } from '@/api/account/axios';
import { useAddToCart } from '@/hooks/queries/useCart';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import Product from '@/components/Details/Product';
import { toast } from 'sonner';

const availableColors = ['#000000', '#FFFFFF'];
const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface ProductGridProps {
  products: ProductType[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [productId: number]: { color: string; size: string };
  }>({});
  const [feedbackMessages, setFeedbackMessages] = useState<{ [productId: number]: string | null }>(
    {}
  );
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openCart = useCartStore((state) => state.openCart);
  const { mutate: addToCart } = useAddToCart();

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
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const { id, name } = product;
    const selectedColor = selectedAttributes[id]?.color || availableColors[0];
    const selectedSize = selectedAttributes[id]?.size || availableSizes[0];

    const wishlistItem: AddWishlistItemRequest = {
      product_id: id,
      color: selectedColor,
      size: selectedSize as Size,
    };

    try {
      await addToWishlist(wishlistItem);
      toast.success(`"${name}" has been added to your wishlist!`);
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
      toast.error('Failed to add item to wishlist.');
    }
  };

  const handleAddToCartClick = (product: ProductType) => {
    const selectedColor = selectedAttributes[product.id]?.color || availableColors[0];
    const selectedSize = selectedAttributes[product.id]?.size || availableSizes[0];

    addToCart(
      {
        product_id: product.id,
        quantity: 1,
        color: selectedColor,
        size: selectedSize as Size,
      },
      {
        onSuccess: () => {
          openCart();
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
        },
        onError: () => {
          setFeedbackMessages((prev) => ({
            ...prev,
            [product.id]: 'Failed to add item to cart.',
          }));
          setTimeout(() => {
            setFeedbackMessages((prev) => ({
              ...prev,
              [product.id]: null,
            }));
          }, 3000);
        },
      }
    );
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-3">
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
              onAddToCart={() => handleAddToCartClick(product)}
              onAddToWishlist={() => handleAddToWishlist(product)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;
