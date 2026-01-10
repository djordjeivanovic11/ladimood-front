'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import CartSidebar from '@/components/Order/Cart/CartSidebar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { useCurrentUser } from '@/hooks/queries/useAuth';
import { Badge } from '@/components/ui/badge';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Use Zustand stores
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const cartItems = useCartStore((state) => state.items);

  // Fetch current user on mount if token exists
  useCurrentUser();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProtectedLink = (path: string) => {
    if (isAuthenticated) {
      router.push(path);
    } else {
      router.push('/auth/login');
    }
  };

  const handleShopLink = () => {
    router.push('/shop');
    setMenuOpen(false);
  };

  const handleMenuClose = () => setMenuOpen(false);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? 'h-[100px] bg-white shadow-lg backdrop-blur-lg' : 'h-[120px] bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" passHref>
            <div className="flex h-full cursor-pointer items-center">
              <Image
                src="/images/logo.png"
                alt="LADIMOOD logo"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden items-center space-x-8 md:flex">
            <div
              onClick={handleShopLink}
              className="cursor-pointer font-serif text-lg text-primary hover:text-primary/80"
            >
              Shop
            </div>
            <div
              onClick={() => router.push('/contact')}
              className="cursor-pointer font-serif text-lg text-primary hover:text-primary/80"
            >
              Kontakt
            </div>
            {isAuthenticated ? (
              <FaUser
                onClick={() => handleProtectedLink('/account')}
                className="cursor-pointer text-lg text-primary hover:text-primary/80"
              />
            ) : (
              <Link
                href="/auth/login"
                className="font-serif text-lg text-primary hover:text-primary/80"
              >
                Login
              </Link>
            )}
            <button
              onClick={openCart}
              className="relative cursor-pointer text-primary hover:text-primary/80"
              aria-label="Open cart"
            >
              <FaShoppingCart className="text-lg" />
              {cartItemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl text-primary focus:outline-none"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-background shadow-lg ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300`}
        >
          <div className="flex flex-col space-y-4 p-4">
            <Link href="/" onClick={handleMenuClose}>
              <Image
                src="/images/logo.png"
                alt="LADIMOOD logo"
                width={120}
                height={60}
                className="object-contain"
              />
            </Link>
            <div
              onClick={handleShopLink}
              className="cursor-pointer font-serif text-lg text-primary"
            >
              Shop
            </div>
            <div
              onClick={() => {
                router.push('/contact');
                handleMenuClose();
              }}
              className="cursor-pointer font-serif text-lg text-primary"
            >
              Kontakt
            </div>
            {isAuthenticated ? (
              <FaUser
                onClick={() => {
                  handleProtectedLink('/account');
                  handleMenuClose();
                }}
                className="cursor-pointer text-lg text-primary"
              />
            ) : (
              <Link
                href="/auth/login"
                className="font-serif text-lg text-primary"
                onClick={handleMenuClose}
              >
                Login
              </Link>
            )}
            <button
              onClick={() => {
                openCart();
                handleMenuClose();
              }}
              className="relative w-fit text-primary"
              aria-label="Open cart"
            >
              <FaShoppingCart className="text-lg" />
              {cartItemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Cart Sidebar - now uses internal Zustand state */}
      <CartSidebar isOpen={isCartOpen} closeCart={closeCart} />
    </>
  );
};

export default Navbar;
