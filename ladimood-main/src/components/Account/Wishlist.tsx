"use client";
import React, { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "@/api/account/axios";
import { WishlistItem } from "@/app/types/types";
import Image from "next/image";

const Wishlist: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    getWishlist().then(setWishlist).catch(console.error);
  }, []);

  const handleRemove = async (itemId: number) => {
    try {
      await removeFromWishlist(itemId);
      setWishlist(wishlist.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Failed to remove item from wishlist", error);
    }
  };

  const handleShop = (_productId: number) => {
    window.location.href = `/shop`;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 border border-gray-200 max-w-xl mx-auto my-6">
      {wishlist.length > 0 ? (
        <div className="space-y-4">
          {/* Header */}
          <h2 className="text-2xl font-bold text-gray-800 text-center border-b border-gray-300 pb-4">
            Your Wishlist
          </h2>

          {/* Wishlist Items */}
          <ul className="space-y-4">
            {wishlist.map((item) => (
              <li
                key={item.id}
                className="flex flex-col bg-gray-50 shadow rounded-md p-4 border border-gray-200"
              >
                {/* Product Image */}
                {item.product.image_url && (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full sm:w-32 h-32 object-cover rounded-md border border-gray-300 mb-3 mx-auto"
                  />
                )}

                {/* Product Details */}
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {item.product.description}
                  </p>
                  <p className="text-sm text-gray-800 mt-2 font-medium">
                    Price: €{item.product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-center mt-2 gap-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Color:</span>
                      <div
                        className="w-6 h-6 rounded-full border border-black ml-2"
                        style={{ backgroundColor: item.color }}
                        title={`Color: ${item.color}`}
                      ></div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Size:</span>
                      <span className="text-sm text-black font-semibold ml-2">
                        {item.size}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-center gap-2 mt-4">
                  <button
                    onClick={() => handleShop(item.product.id)}
                    className="bg-[#0097B2] text-white px-4 py-2 rounded-md hover:bg-[#007A90] transition-all"
                  >
                    Shop Now
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="bg-gray-300 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-4">
          Your wishlist is empty.
        </p>
      )}
    </div>
  );
};

export default Wishlist;
