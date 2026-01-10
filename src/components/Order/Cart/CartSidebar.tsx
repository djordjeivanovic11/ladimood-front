'use client';

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import CartItemComponent from './CartItem';
import CallToOrder from '@/components/Order/Cart/CallToOrder';
import { useCartStore } from '@/stores/useCartStore';
import { useRemoveFromCart, useUpdateCartItem, useCartQuery } from '@/hooks/queries/useCart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Size } from '@/app/types/types';

interface CartSidebarProps {
  isOpen: boolean;
  closeCart: () => void;
}

function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-lg border p-4">
          <Skeleton className="h-20 w-20 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, closeCart }) => {
  const cartItems = useCartStore((state) => state.items);
  const { isLoading, refetch } = useCartQuery();
  const { mutate: removeFromCart } = useRemoveFromCart();
  const { mutate: updateCartItem } = useUpdateCartItem();

  React.useEffect(() => {
    if (isOpen) {
      void refetch();
    }
  }, [isOpen, refetch]);

  const handleRemoveFromCart = (itemId: number, color: string, size: Size) => {
    removeFromCart({ itemId, color, size });
  };

  const handleUpdateQuantity = (itemId: number, color: string, size: Size, quantity: number) => {
    updateCartItem({ itemId, quantity, color, size });
  };

  const handleOrder = () => {
    closeCart();
  };

  const handleCancelOrder = () => {
    closeCart();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full transform bg-background shadow-xl transition-transform duration-300 ease-in-out sm:w-96 md:w-[28rem] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-bold text-primary sm:text-2xl">Your Cart</h2>
            <Button variant="ghost" size="icon" onClick={closeCart} aria-label="Close Cart">
              <FaTimes className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <CartSkeleton />
            ) : cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center">
                <p className="font-bold text-primary">Your cart is empty.</p>
                <Button onClick={closeCart} className="mt-4">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemComponent
                    key={`${item.id}-${item.color}-${item.size}`}
                    item={item}
                    updateQuantity={handleUpdateQuantity}
                    removeFromCart={handleRemoveFromCart}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-4">
              <CallToOrder
                cartItems={cartItems}
                onOrder={handleOrder}
                onCancel={handleCancelOrder}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
