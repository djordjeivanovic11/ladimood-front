'use client';

import React from 'react';
import Image from 'next/image';
import { FaTimes, FaMinus, FaPlus } from 'react-icons/fa';
import { CartItem as CartItemType, Size } from '@/app/types/types';
import { getPrimaryProductImageUrl } from '@/components/Management/catalog/catalog-image';
import { IMAGE_SIZES } from '@/lib/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CartItemProps {
  item: CartItemType;
  updateQuantity: (id: number, color: string, size: Size, quantity: number) => void;
  removeFromCart: (id: number, color: string, size: Size) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, updateQuantity, removeFromCart }) => {
  const imageSrc =
    getPrimaryProductImageUrl(item.product) ??
    item.product.image_url ??
    '/images/default-product.jpg';
  const handleIncrement = () => {
    updateQuantity(item.id, item.color, item.size as Size, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.color, item.size as Size, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id, item.color, item.size as Size);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        {/* Product Image */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-20">
          <Image
            src={imageSrc}
            alt={item.product.name}
            fill
            sizes={IMAGE_SIZES.cartThumb}
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-semibold">{item.product.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: item.color }} />
            <span>Veličina: {item.size}</span>
          </div>
          <p className="font-bold text-primary">€{item.product.price.toFixed(2)}</p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              aria-label="Smanji količinu"
            >
              <FaMinus className="h-3 w-3" />
            </Button>
            <span className="w-9 text-center text-base font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              onClick={handleIncrement}
              aria-label="Povećaj količinu"
            >
              <FaPlus className="h-3 w-3" />
            </Button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleRemove}
            aria-label="Ukloni artikal iz korpe"
          >
            <FaTimes className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;
