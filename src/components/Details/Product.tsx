'use client';

import React from 'react';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';
import { addToWishlist as addToWishlistAPI } from '@/api/account/axios';
import { Product as ProductType } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function swatchBgClass(hex: string) {
  const normalized = hex.trim().toLowerCase();
  if (normalized === '#000000' || normalized === '#000') return 'bg-black';
  if (normalized === '#ffffff' || normalized === '#fff') return 'bg-white';
  // Fallback: keep neutral background (no inline style due to lint rules)
  return 'bg-muted';
}

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
  const handleAddToWishlist = async () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Odaberi boju i veličinu prije dodavanja u listu želja.');
      return;
    }

    try {
      await addToWishlistAPI({
        product_id: product.id,
        color: selectedColor,
        size: selectedSize,
      });
      toast.success('Dodato u listu želja.');
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'ItemAlreadyInWishlist') {
        toast.message('Već je u listi želja.');
      } else {
        toast.error('Nije moguće dodati u listu želja.');
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
          className="object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="text-center">
          <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary sm:text-xl">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            €{product.price.toFixed(2)}
          </p>
        </div>

        {/* Color Selection */}
        <div className="flex justify-center gap-2 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100">
          {availableColors.map((color, index) => (
            <button
              key={index}
              title={`Select color ${color}`}
              onClick={() => onSelectColor(color)}
              className={cn(
                'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                selectedColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-border',
                swatchBgClass(color)
              )}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        {/* Size Selection */}
        <div className="flex flex-wrap justify-center gap-2 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100">
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
          <Button
            onClick={() => {
              onAddToCart();
              toast.success('Dodato u korpu.');
            }}
            className="flex-1"
          >
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
      </CardContent>
    </Card>
  );
};

export default Product;
