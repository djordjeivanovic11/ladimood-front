"use client";
import React, { useEffect, useState } from 'react';
import { getCart, removeFromCart, clearCart } from '@/api/account/axios';
import { Cart as CartType, CartItem as CartItemType, SizeEnum } from '@/app/types/types';

const Cart: React.FC = () => {
    const [cart, setCart] = useState<CartType | null>(null);

    // Fetch the cart data on component mount
    useEffect(() => {
        getCart().then(setCart).catch(console.error);
    }, []);

    // Handle removing an item from the cart
    const handleRemove = async (itemId: number, color: string, size: string) => {
        try {
            await removeFromCart(itemId, color, size as SizeEnum);
            const updatedCart = await getCart();  // Fetch the updated cart after removal
            setCart(updatedCart);
        } catch (error) {
            console.error('Failed to remove item from cart', error);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-[#0097B2] max-w-md mx-auto my-6 md:my-10">
            {cart && cart.items.length > 0 ? (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-center sm:text-left text-gray-900 mb-4">
                        Shopping Cart
                    </h2>
                    <ul className="space-y-4">
                        {cart.items.map((item: CartItemType) => (
                            <li 
                                key={item.id} 
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <div className="flex-grow mb-4 sm:mb-0">
                                        <p className="text-lg font-semibold text-gray-800">{item.product.name}</p>
                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        <p className="text-sm text-gray-600">Color: {item.color}</p>
                                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemove(item.id, item.color, item.size)} 
                                    className="bg-[#0097B2] text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors w-full sm:w-auto mt-4 sm:mt-0"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="text-center text-gray-500 text-lg mt-6">Your cart is empty.</p>
            )}
        </div>
    );
};

export default Cart;
