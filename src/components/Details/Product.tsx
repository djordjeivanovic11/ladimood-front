'use client';

import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { addToWishlist as addToWishlistAPI } from '@/api/account/axios';
import type { Product as ProductType, ProductMedia } from '@/app/types/types';
import {
  getPrimaryProductImageUrl,
  getSortedProductMedia,
} from '@/components/Management/catalog/catalog-image';
import { ProductCardImageCarousel } from '@/components/Details/ProductCardImageCarousel';
import { IMAGE_SIZES } from '@/lib/image';
import type { ProductColorOption } from '@/lib/product-variants';
import { normalizeHex } from '@/components/Management/catalog/catalog-colors';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function isLightSwatch(hex: string) {
  const normalized = normalizeHex(hex);
  return normalized === '#ffffff' || normalized === '#f5f5dc';
}

interface ProductProps {
  product: ProductType;
  layoutVariant?: 'home' | 'shop';
  availableColors: ProductColorOption[];
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
  layoutVariant = 'home',
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

  const sortedMedia = getSortedProductMedia(product);
  const fallbackImageSrc = getPrimaryProductImageUrl(product) || '/images/default-product.jpg';
  const displayMedia: ProductMedia[] =
    sortedMedia.length > 0
      ? sortedMedia
      : [
          {
            id: -product.id,
            url: fallbackImageSrc,
          },
        ];
  const imageSizes =
    layoutVariant === 'shop' ? IMAGE_SIZES.productCardShop : IMAGE_SIZES.productCardHome;
  const isSoldOut = Boolean(product.is_sold_out);
  const [isCardHovered, setIsCardHovered] = React.useState(false);

  return (
    <Card
      className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <ProductCardImageCarousel
        media={displayMedia}
        productName={product.name}
        sizes={imageSizes}
        isSoldOut={isSoldOut}
        isCardHovered={isCardHovered}
      />
      <CardContent className="space-y-4 p-4 sm:space-y-5 sm:p-5">
        <div className="text-center">
          <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary sm:text-xl">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            €{product.price.toFixed(2)}
          </p>
        </div>

        {availableColors.length > 0 ? (
          <TooltipProvider delayDuration={150}>
            <div className="flex justify-center gap-2">
              {availableColors.map((color) => (
                <Tooltip key={color.hex}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      title={color.name}
                      onClick={() => onSelectColor(color.hex)}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 sm:h-9 sm:w-9',
                        selectedColor === color.hex
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-border',
                        isLightSwatch(color.hex) && 'border-muted-foreground/40'
                      )}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Odaberi boju ${color.name}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="px-2 py-1 text-xs">
                    {color.name}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        ) : null}

        <div className="flex flex-wrap justify-center gap-2">
          {availableSizes.map((size, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectSize(size)}
              className={cn(
                'min-h-11 rounded-full border px-3 py-2 text-sm font-semibold transition-all',
                selectedSize === size
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-muted'
              )}
              aria-label={`Odaberi veličinu ${size}`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              onAddToCart();
            }}
            className="min-h-11 flex-1"
            disabled={isSoldOut || availableColors.length === 0 || availableSizes.length === 0}
          >
            {isSoldOut ? 'Rasprodato' : 'Dodaj u korpu'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11"
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
