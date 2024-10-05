import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import CartItemComponent from './CartItem';
import { CartItem, CartSidebarProps, SizeEnum } from '@/app/types/types';
import CallToOrder from '@/components/Order/Cart/CallToOrder';
import { getCart, removeFromCart, addToCart } from '@/api/account/axios';

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, closeCart }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  
  useEffect(() => {
    if (isOpen) {
      const fetchCartItems = async () => {
        try {
          const response = await getCart();
          setCartItems(response.items);
        } catch (error) {
          console.error('Failed to load cart items:', error);
        }
      };

      fetchCartItems();
    }
  }, [isOpen]);

  const handleRemoveFromCart = async (id: number, color: string, size: string) => {
    try {
      await removeFromCart(id, color, size as SizeEnum);
      setCartItems((prevItems) =>
        prevItems.filter((item) => !(item.id === id && item.color === color && item.size === size))
      );
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  };

  const handleUpdateQuantity = async (id: number, color: string, size: string, quantity: number) => {
    try {
      const itemToUpdate = cartItems.find((item) => item.color === color && item.size === size);
      if (itemToUpdate) {
        await addToCart({ ...itemToUpdate, quantity });
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id && item.color === color && item.size === size ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleOrder = () => {
    closeCart(); 
  };

  const handleCancelOrder = () => {
    closeCart(); 
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-96 md:w-[30rem] bg-white shadow-lg transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 z-50`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0097B2]">Your Cart</h2>
          <button onClick={closeCart} className="text-gray-600 hover:text-gray-800">
            <FaTimes size={24} />
          </button>
        </div>
        {cartItems.length === 0 ? (
          <p className="text-md font-bold text-[#0097B2]">Your cart is empty.</p>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4">
              {cartItems.map((item) => (
                <CartItemComponent
                  key={`${item.id}-${item.color}-${item.size}`}
                  item={item}
                  updateQuantity={handleUpdateQuantity}
                  removeFromCart={handleRemoveFromCart}
                />
              ))}
            </div>

            <CallToOrder
              cartItems={cartItems}
              onOrder={handleOrder}
              onCancel={handleCancelOrder}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
