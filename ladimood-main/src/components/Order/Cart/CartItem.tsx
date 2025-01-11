import React from 'react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import { CartItem as CartItemType } from '@/app/types/types';

interface CartItemProps {
  item: CartItemType;
  updateQuantity: (id: number, color: string, size: string, quantity: number) => void;
  removeFromCart: (id: number, color: string, size: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, updateQuantity, removeFromCart }) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      updateQuantity(item.id, item.color, item.size, value);
    }
  };

  return (
    <div className="flex items-center p-4 border-b">
      <div className="w-16 h-16 mr-4">
        <Image
          src={item.product.image_url ?? '/placeholder.jpg'}
          alt={item.product.name}
          width={64}
          height={64}
          className="rounded-lg object-cover"
        />
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">{item.product.name}</h3>
        <div className="flex items-center space-x-2 mt-1">
          <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: item.color }} />
          <span className="text-sm text-gray-600">Size: {item.size}</span>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <p className="text-lg font-bold text-gray-800">€{item.product.price}</p>
        <div className="flex items-center">
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={handleQuantityChange}
            className="w-12 text-center text-black border border-gray-300"
            title="Quantity"
          />
        </div>
      </div>

      <button
        onClick={() => removeFromCart(item.id, item.color, item.size)}
        className="ml-4 text-red-600 hover:text-red-800"
        title="Remove item from cart"
      >
        <FaTimes size={16} />
      </button>
    </div>
  );
};

export default CartItem;
