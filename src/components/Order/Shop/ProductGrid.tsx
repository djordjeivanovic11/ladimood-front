'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product as ProductType, Size, AddWishlistItemRequest } from '@/app/types/types';
import { addToWishlist } from '@/api/account/axios';
import { useAddToCart } from '@/hooks/queries/useCart';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import Product from '@/components/Details/Product';
import {
  getProductColorOptions,
  getProductDefaultSelections,
  getProductSizesForColor,
} from '@/lib/product-variants';
import { toast } from 'sonner';

interface ProductGridProps {
  products: ProductType[];
  /** Shop layout: cards grow to fill the product column (fewer empty gaps). */
  variant?: 'home' | 'shop';
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, variant = 'home' }) => {
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

  const handleSelectColor = (productId: number, product: ProductType, color: string) => {
    const sizesForColor = getProductSizesForColor(product, color);

    setSelectedAttributes((prev) => {
      const previousSize = prev[productId]?.size;
      const nextSize =
        previousSize && sizesForColor.includes(previousSize as (typeof sizesForColor)[number])
          ? previousSize
          : (sizesForColor[0] ?? '');

      return {
        ...prev,
        [productId]: {
          color,
          size: nextSize,
        },
      };
    });
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
    const defaultSelections = getProductDefaultSelections(product);
    if (!defaultSelections) {
      toast.error('Ovaj proizvod trenutno nema dostupnih varijanti.');
      return;
    }

    const selectedColor = selectedAttributes[id]?.color || defaultSelections.color;
    const selectedSize = selectedAttributes[id]?.size || defaultSelections.size;

    const wishlistItem: AddWishlistItemRequest = {
      product_id: id,
      color: selectedColor,
      size: selectedSize as Size,
    };

    try {
      await addToWishlist(wishlistItem);
      toast.success(`"${name}" je dodato u listu želja!`);
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
      toast.error('Dodavanje u listu želja nije uspjelo.');
    }
  };

  const handleAddToCartClick = (product: ProductType) => {
    const defaultSelections = getProductDefaultSelections(product);
    if (!defaultSelections) {
      toast.error('Ovaj proizvod trenutno nema dostupnih varijanti.');
      return;
    }

    const selectedColor = selectedAttributes[product.id]?.color || defaultSelections.color;
    const selectedSize = selectedAttributes[product.id]?.size || defaultSelections.size;

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
            [product.id]: 'Dodato u korpu!',
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
            [product.id]: 'Dodavanje u korpu nije uspjelo.',
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
      <div
        className={
          variant === 'shop'
            ? 'grid w-full grid-cols-1 justify-start gap-6 sm:grid-cols-[repeat(auto-fit,minmax(15.5rem,22rem))] lg:grid-cols-[repeat(auto-fit,minmax(17.5rem,24rem))]'
            : 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3'
        }
      >
        {products.map((product) => {
          const { id } = product;
          const colorOptions = getProductColorOptions(product);
          const defaultSelections = getProductDefaultSelections(product);
          const selectedColor = selectedAttributes[id]?.color ?? defaultSelections?.color ?? '';
          const availableSizes = selectedColor
            ? getProductSizesForColor(product, selectedColor)
            : [];
          const selectedSize = selectedAttributes[id]?.size ?? availableSizes[0] ?? '';
          const hasVariants = colorOptions.length > 0 && availableSizes.length > 0;

          return (
            <Product
              key={id}
              product={product}
              layoutVariant={variant}
              availableColors={colorOptions}
              availableSizes={availableSizes}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              feedbackMessage={feedbackMessages[id] || null}
              onSelectColor={(color) => handleSelectColor(id, product, color)}
              onSelectSize={(size) => handleSelectSize(id, size)}
              onAddToCart={() => {
                if (!hasVariants) {
                  toast.error('Ovaj proizvod trenutno nema dostupnih varijanti.');
                  return;
                }
                handleAddToCartClick(product);
              }}
              onAddToWishlist={() => handleAddToWishlist(product)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;
