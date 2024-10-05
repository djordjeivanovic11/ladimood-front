"use client";
import React, { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '@/api/account/axios';
import { WishlistItem } from '@/app/types/types';

const Wishlist: React.FC = () => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

    // Fetch the wishlist on component mount
    useEffect(() => {
        getWishlist().then(setWishlist).catch(console.error);
    }, []);

    // Remove item from wishlist
    const handleRemove = async (itemId: number) => {
        try {
            await removeFromWishlist(itemId);
            setWishlist(wishlist.filter(item => item.id !== itemId));  // Update state after removal
        } catch (error) {
            console.error('Failed to remove item from wishlist', error);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-[#0097B2] max-w-md mx-auto my-6 md:my-10">
            {wishlist.length > 0 ? (
                <ul className="space-y-4">
                    {wishlist.map(item => (
                        <li 
                            key={item.id} 
                            className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <span className="text-lg font-semibold text-gray-800 mb-2 md:mb-0 text-center md:text-left">{item.product.name}</span>
                            <button 
                                onClick={() => handleRemove(item.id)} 
                                className="bg-[#0097B2] text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors w-full md:w-auto"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500">Your wishlist is empty.</p>
            )}
        </div>
    );
};

export default Wishlist;
