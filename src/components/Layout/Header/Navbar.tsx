'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import CartSidebar from '@/components/Order/Cart/CartSidebar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { useCartQuery } from '@/hooks/queries/useCart';
import { useCurrentUser } from '@/hooks/queries/useAuth';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navLinkClass =
  'cursor-pointer font-serif text-base text-foreground/90 transition-colors hover:text-primary md:text-lg';

const desktopNavLinkClass =
  'cursor-pointer font-serif text-lg font-semibold text-foreground/90 transition-colors hover:text-primary md:text-xl';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const { data: cart } = useCartQuery();
  const cartItems = cart?.items ?? [];

  useCurrentUser();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

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
        className={cn(
          'nav-glass fixed top-0 z-50 w-full transition-[background,box-shadow,backdrop-filter] duration-500 ease-out',
          'h-20 md:h-24',
          !isScrolled && 'nav-glass--idle'
        )}
      >
        <nav className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex h-full shrink-0 items-center py-1"
            onClick={handleMenuClose}
          >
            <Image
              src="/images/logo.svg"
              alt="LADIMOOD logo"
              width={600}
              height={263}
              unoptimized
              className="h-[4.5rem] w-auto max-h-full max-w-[min(22rem,72vw)] object-contain object-left md:h-[5.5rem] md:max-w-[26rem]"
              priority
            />
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <button type="button" onClick={handleShopLink} className={desktopNavLinkClass}>
              Prodavnica
            </button>
            <button
              type="button"
              onClick={() => router.push('/contact')}
              className={desktopNavLinkClass}
            >
              Kontakt
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => handleProtectedLink('/account')}
                className="text-xl text-foreground/90 transition-colors hover:text-primary"
                aria-label="Nalog"
              >
                <FaUser />
              </button>
            ) : (
              <Link href="/auth/login" className={desktopNavLinkClass}>
                Prijava
              </Link>
            )}
            <button
              type="button"
              onClick={openCart}
              className="relative text-lg text-foreground/90 transition-colors hover:text-primary"
              aria-label="Otvori korpu"
            >
              <FaShoppingCart />
              {cartItemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs shadow-sm">
                  {cartItemCount}
                </Badge>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <button
              type="button"
              onClick={openCart}
              className="relative text-lg text-foreground/90"
              aria-label="Otvori korpu"
            >
              <FaShoppingCart />
              {cartItemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl text-foreground/90 focus:outline-none"
              aria-label={menuOpen ? 'Zatvori meni' : 'Otvori meni'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/15 backdrop-blur-[2px] transition-opacity md:hidden"
          aria-label="Zatvori meni"
          onClick={handleMenuClose}
        />
      )}

      <aside
        className={cn(
          'nav-drawer-glass fixed left-0 top-0 z-[45] h-dvh w-[min(18rem,85vw)] transform transition-transform duration-300 ease-out md:hidden',
          menuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        )}
        aria-hidden={!menuOpen}
      >
        <div className="flex h-20 items-center border-b border-white/30 px-4 py-1">
          <Link href="/" className="flex h-full items-center" onClick={handleMenuClose}>
            <Image
              src="/images/logo.svg"
              alt="LADIMOOD logo"
              width={600}
              height={263}
              unoptimized
              className="h-full w-auto max-w-[12rem] object-contain object-left"
            />
          </Link>
        </div>
        <div className="flex flex-col gap-1 p-4">
          <button
            type="button"
            onClick={handleShopLink}
            className={cn(navLinkClass, 'rounded-lg px-3 py-3 text-left')}
          >
            Prodavnica
          </button>
          <button
            type="button"
            onClick={() => {
              router.push('/contact');
              handleMenuClose();
            }}
            className={cn(navLinkClass, 'rounded-lg px-3 py-3 text-left')}
          >
            Kontakt
          </button>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                handleProtectedLink('/account');
                handleMenuClose();
              }}
              className={cn(navLinkClass, 'flex items-center gap-2 rounded-lg px-3 py-3 text-left')}
            >
              <FaUser />
              Nalog
            </button>
          ) : (
            <Link
              href="/auth/login"
              className={cn(navLinkClass, 'rounded-lg px-3 py-3')}
              onClick={handleMenuClose}
            >
              Prijava
            </Link>
          )}
        </div>
      </aside>

      <CartSidebar isOpen={isCartOpen} closeCart={closeCart} />
    </>
  );
};

export default Navbar;
