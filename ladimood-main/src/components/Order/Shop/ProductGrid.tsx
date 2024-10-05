import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, ProductGridProps, WishlistItem, SizeEnum, CartItem } from '@/app/types/types';
import { FaHeart } from 'react-icons/fa';
import { addToWishlist, getCurrentUser, addToCart, getCart } from '@/api/account/axios';
import CartSidebar from '@/components/Order/Cart/CartSidebar'; 


const availableColors = ['#000000', '#FFFFFF', '#0097B2']; 
const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']; 

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [productId: number]: { color: string; size: string };
  }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [cartItems, setCartItems] = useState<CartItem[]>([]); 
  const [feedbackMessages, setFeedbackMessages] = useState<{ [productId: number]: string | null }>({}); 
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      getCurrentUser()
        .then((user) => {
          if (user) {
            setIsLoggedIn(true);
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
        });
    }
  }, []);


  const handleSelectColor = (productId: number, color: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], color }, 
    }));
  };


  const handleSelectSize = (productId: number, size: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], size },
    }));
  };


  const handleAddToWishlist = async (product: Product) => {
    if (!isLoggedIn) {
      router.push('/auth/login'); 
      return;
    }

    const { id, name } = product;
    const selectedColor = selectedAttributes[id]?.color || availableColors[0];
    const selectedSize = selectedAttributes[id]?.size || availableSizes[0];

    const wishlistItem: WishlistItem = {
      id,
      product,
      color: selectedColor,
      size: selectedSize as SizeEnum,
    };

    try {
      await addToWishlist(wishlistItem);
      setFeedbackMessages((prev) => ({
        ...prev,
        [id]: `"${name}" has been added to your wishlist!`,
      }));


      setTimeout(() => {
        setFeedbackMessages((prev) => ({
          ...prev,
          [id]: null,
        }));
      }, 3000);

    } catch (error: any) {
      console.error('Error adding item to wishlist:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add item to wishlist.';
      setFeedbackMessages((prev) => ({
        ...prev,
        [id]: errorMessage,
      }));


      setTimeout(() => {
        setFeedbackMessages((prev) => ({
          ...prev,
          [id]: null,
        }));
      }, 3000);
    }
  };


  const handleAddToCartWithLoginCheck = async (product: Product) => {
    
    if (!isLoggedIn) {

      router.push('/auth/login');
      return;
    }

    const selectedColor = selectedAttributes[product.id]?.color || availableColors[0];
    const selectedSize = selectedAttributes[product.id]?.size || availableSizes[0];

    try {
      const newCartItem: CartItem = {
        id: product.id,
        product,
        quantity: 1,
        color: selectedColor,
        size: selectedSize as SizeEnum,
      };

      
      await addToCart(newCartItem);

  
      const updatedCart = await getCart();
      setCartItems(updatedCart.items);


      setIsCartOpen(true);

      setFeedbackMessages((prev) => ({
        ...prev,
        [product.id]: 'Item added to cart!',
      }));


      setTimeout(() => {
        setFeedbackMessages((prev) => ({
          ...prev,
          [product.id]: null,
        }));
      }, 3000);

    } catch (error) {
      console.error('Error adding item to cart:', error);
      setFeedbackMessages((prev) => ({
        ...prev,
        [product.id]: 'Failed to add item to cart as it is already in the cart.',
      }));


      setTimeout(() => {
        setFeedbackMessages((prev) => ({
          ...prev,
          [product.id]: null,
        }));
      }, 3000);
    }
  };

  return (
    <div className='mt-10'>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 p-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
            style={{ minHeight: '500px' }} 
          >
            {/* Product Image */}
            <div className="relative w-full h-64">
              <Image
                src={product.image_url || '/images/default-product.jpg'} // Fallback image if none is provided
                alt={product.name}
                layout="fill"
                objectFit="contain" // Better visibility of the image, less zoomed in
                className="transition-transform transform group-hover:scale-105 duration-300"
              />
            </div>

            {/* Product Details */}
            <div className="p-6 text-center flex-grow">
              <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-[#0097B2]">
                {product.name}
              </h3>
              <p className="text-lg text-gray-600 mb-2">€{product.price.toFixed(2)}</p>

              {/* Color Options */}
              <div className="flex justify-center items-center space-x-2 mb-4">
                {availableColors.map((color, index) => (
                  <button
                    key={index}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full border transition-colors ${
                      selectedAttributes[product.id]?.color === color
                        ? 'border-teal-300 border-4 shadow-lg'
                        : 'border-gray-300 border-2'
                    } hover:border-teal-300`}
                    onClick={() => handleSelectColor(product.id, color)}
                  />
                ))}
              </div>

              {/* Size Options */}
              <div className="flex justify-center items-center space-x-2 mb-4">
                {availableSizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSize(product.id, size)}
                    className={`text-sm font-semibold px-3 py-2 border rounded-full cursor-pointer transition-all 
                      ${
                        selectedAttributes[product.id]?.size === size
                          ? 'bg-[#0097B2] text-white border-[#0097B2]'
                          : 'border-gray-300 text-gray-800 hover:bg-gray-200'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons (Add to Cart & Add to Wishlist) */}
            <div className="flex justify-between items-center p-4">
              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCartWithLoginCheck(product)} // Use selected color and size
                className="flex-1 bg-[#0097B2] text-white text-lg font-semibold py-2 px-4 rounded-md transition-all mr-2"
              >
                Add to Cart
              </button>

              {/* Add to Wishlist Button */}
              <button
                onClick={() => handleAddToWishlist(product)} // Use selected color and size
                className="flex items-center justify-center bg-transparent border border-[#0097B2] text-[#0097B2] p-2 rounded-md transition-all hover:bg-[#0097B2] hover:text-white"
              >
                <FaHeart className="text-lg" />
              </button>
            </div>

            {/* Feedback Message under Product Card */}
            {feedbackMessages[product.id] && (
              <div className="p-2 mt-2 text-center text-sm rounded bg-green-100 text-green-700">
                {feedbackMessages[product.id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        closeCart={() => setIsCartOpen(false)}
        cartItems={cartItems}
        removeFromCart={() => {}} 
        updateQuantity={() => {}} 
      />
    </div>
  );
};

export default ProductGrid;
