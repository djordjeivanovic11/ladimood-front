'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';
import { addToWishlist as addToWishlistAPI } from '@/api/account/axios';
import { Product as ProductType } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  onAddToWishlist?: () => void;
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
}) => {
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (wishlistFeedback) {
      const timer = setTimeout(() => setWishlistFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [wishlistFeedback]);

  const handleAddToWishlist = async () => {
    if (!selectedColor || !selectedSize) {
      setFeedbackMessage('Please select a color and size before adding to the wishlist.');
      return;
    }

    try {
      await addToWishlistAPI({
        product_id: product.id,
        color: selectedColor,
        size: selectedSize,
      });
      setWishlistFeedback('Item successfully added to wishlist!');
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'ItemAlreadyInWishlist') {
        setWishlistFeedback('Item is already in your wishlist!');
      } else {
        setWishlistFeedback('Failed to add item to wishlist. Try again later.');
      }
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={product.image_url || '/images/default-product.jpg'}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="space-y-4 p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mt-1 text-lg text-muted-foreground">€{product.price.toFixed(2)}</p>
        </div>

        {/* Color Selection */}
        <div className="flex justify-center gap-2">
          {availableColors.map((color, index) => (
            <button
              key={index}
              title={`Select color ${color}`}
              onClick={() => onSelectColor(color)}
              className={cn(
                'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                selectedColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-border'
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        {/* Size Selection */}
        <div className="flex flex-wrap justify-center gap-2">
          {availableSizes.map((size, index) => (
            <button
              key={index}
              onClick={() => onSelectSize(size)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm font-semibold transition-all',
                selectedSize === size
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-muted'
              )}
              aria-label={`Select size ${size}`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={onAddToCart} className="flex-1">
            Dodaj u korpu
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddToWishlist}
            title="Dodaj u listu želja"
            aria-label="Dodaj u listu želja"
          >
            <FaHeart className="h-4 w-4" />
          </Button>
        </div>

        {/* Feedback Messages */}
        {(feedbackMessage || wishlistFeedback) && (
          <Badge
            variant={
              wishlistFeedback?.includes('added')
                ? 'default'
                : wishlistFeedback?.includes('already')
                  ? 'secondary'
                  : 'destructive'
            }
            className="w-full justify-center py-2"
          >
            {wishlistFeedback || feedbackMessage}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default Product;
