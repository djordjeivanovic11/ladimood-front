"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaViber, FaWhatsapp, FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import LangSwitch from '../Header/LangSwitch';
import CartSidebar from '@/components/Order/Cart/CartSidebar';
import { CartItem } from '@/app/types/types';
import { getCart, getCurrentUser } from '@/api/account/axios'; 

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check if the token is valid by fetching user info
      getCurrentUser()
        .then((user) => {
          if (user) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        })
        .catch(() => {
          setIsLoggedIn(false); // In case of error or invalid token
        });
    }
  }, []);

  // Fetch cart items when the cart opens
  useEffect(() => {
    if (cartOpen) {
      getCart()
        .then((cartData) => {
          setCartItems(cartData.items);
        })
        .catch((error) => {
          console.error('Failed to load cart items:', error);
        });
    }
  }, [cartOpen]);

  const removeFromCart = (id: number, color: string, size: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.color === color && item.size === size))
    );
  };

  const updateQuantity = (id: number, color: string, size: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.color === color && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Function to handle links that require login
  const handleProtectedLink = (path: string) => {
    if (isLoggedIn) {
      router.push(path);
    } else {
      router.push('/auth/login'); // Redirect to login if not logged in
    }
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-white shadow-md h-[120px] overflow-hidden">
        <nav className="max-w-screen-xl mx-auto flex items-center justify-between h-full px-6">
          <Link href="/" passHref>
            <div className="flex items-center h-full mt-7 cursor-pointer">
              <Image src="/images/logo.png" alt="LADIMOOD logo" width={200} height={100} className="object-contain" />
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <div
              onClick={() => handleProtectedLink('/shop')}
              className="cursor-pointer text-lg font-serif text-[#0097B2] transition-transform transform hover:scale-105 hover:text-teal-200"
            >
              Shop
            </div>
            <div className="flex items-center space-x-4 text-[#0097B2]">
              <Link href="viber://chat?number=+38269851872">
                <FaViber size={24} className="hover:scale-105 hover:text-teal-200 cursor-pointer" />
              </Link>
              <Link href="https://wa.me/+38269851872">
                <FaWhatsapp size={24} className="hover:scale-105 hover:text-teal-200 cursor-pointer" />
              </Link>
            </div>
            <LangSwitch />
            {!isLoggedIn ? (
              <Link href="/auth/login" className="text-lg font-serif text-[#0097B2] transition-transform transform hover:scale-105 hover:text-teal-200">
                Login
              </Link>
            ) : (
              <div onClick={() => handleProtectedLink('/account')} className="cursor-pointer">
                <FaUser className="text-lg font-serif text-[#0097B2] transition-transform transform hover:scale-105 hover:text-teal-200" />
              </div>
            )}
            <div onClick={() => setCartOpen(true)} className="cursor-pointer">
              <FaShoppingCart className="text-lg font-serif text-[#0097B2] transition-transform transform hover:scale-105 hover:text-teal-200" />
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-[#0097B2] text-2xl focus:outline-none">
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>

        <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <div className="p-6 flex flex-col space-y-4">
            <Link href="/" onClick={handleMenuClose}>
              <Image src="/images/logo.png" alt="LADIMOOD logo" width={160} height={80} className="object-contain" />
            </Link>
            <div onClick={() => router.push('/shop')} className="cursor-pointer">
              <span className="text-lg font-serif text-[#0097B2]">Shop</span>
            </div>
            <div className="flex items-center space-x-4 text-[#0097B2]">
              <Link href="viber://chat?number=+38269851872" onClick={handleMenuClose}>
                <FaViber size={24} className="hover:text-teal-200 cursor-pointer" />
              </Link>
              <Link href="https://wa.me/+38269851872" onClick={handleMenuClose}>
                <FaWhatsapp size={24} className="hover:text-teal-200 cursor-pointer" />
              </Link>
            </div>
            <LangSwitch />
            {isLoggedIn ? (
              <div onClick={() => handleProtectedLink('/account')} className="cursor-pointer">
              <FaUser className="text-lg font-serif text-[#0097B2]" />
            </div>
            ) : (
              <Link href="/auth/login" className="text-lg font-serif text-[#0097B2]" onClick={handleMenuClose}>
                Login
              </Link>
            )}
            <div onClick={() => { setCartOpen(true); handleMenuClose(); }} className="cursor-pointer">
              <FaShoppingCart className="text-lg font-serif text-[#0097B2]" />
            </div>
          </div>
        </div>
      </header>

      {cartOpen && (
        <CartSidebar
          isOpen={cartOpen}
          closeCart={() => setCartOpen(false)}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
        />
      )}
    </>
  );
};

export default Navbar;