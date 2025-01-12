"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";
import CartSidebar from "@/components/Order/Cart/CartSidebar";
import { CartItem } from "@/app/types/types";
import { getCart, getCurrentUser } from "@/api/account/axios";

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentUser()
        .then((user) => setIsLoggedIn(!!user))
        .catch(() => setIsLoggedIn(false));
    }
  }, []);

  useEffect(() => {
    if (cartOpen) {
      getCart()
        .then((cartData) => setCartItems(cartData.items))
        .catch((error) => console.error("Failed to load cart items:", error));
    }
  }, [cartOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProtectedLink = (path: string) => {
    if (isLoggedIn) router.push(path);
    else router.push("/auth/login");
  };

  const handleMenuClose = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-lg h-[100px] backdrop-blur-lg"
            : "bg-transparent h-[120px]"
        }`}
      >
        <nav className="max-w-screen-xl mx-auto flex items-center justify-between h-full px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" passHref>
            <div className="flex items-center h-full cursor-pointer">
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
          <div className="hidden md:flex items-center space-x-8">
            <div
              onClick={() => handleProtectedLink("/shop")}
              className="cursor-pointer text-lg font-serif text-[#0097B2] hover:text-teal-200"
            >
              Shop
            </div>
            <div
              onClick={() => handleProtectedLink("/contact")}
              className="cursor-pointer text-lg font-serif text-[#0097B2] hover:text-teal-200"
            >
              Kontakt
            </div>
            {isLoggedIn ? (
              <FaUser
                onClick={() => handleProtectedLink("/account")}
                className="cursor-pointer text-lg text-[#0097B2] hover:text-teal-200"
              />
            ) : (
              <Link
                href="/auth/login"
                className="text-lg font-serif text-[#0097B2] hover:text-teal-200"
              >
                Login
              </Link>
            )}
            <FaShoppingCart
              onClick={() => setCartOpen(true)}
              className="cursor-pointer text-lg text-[#0097B2] hover:text-teal-200"
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#0097B2] text-2xl focus:outline-none"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300`}
        >
          <div className="p-4 flex flex-col space-y-4">
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
              onClick={() => handleProtectedLink("/shop")}
              className="cursor-pointer text-lg font-serif text-[#0097B2]"
            >
              Shoping
            </div>
            <div
              onClick={() => handleProtectedLink("/contact")}
              className="cursor-pointer text-lg font-serif text-[#0097B2]"
            >
              Kontakt
            </div>
            {isLoggedIn ? (
              <FaUser
                onClick={() => handleProtectedLink("/account")}
                className="cursor-pointer text-lg text-[#0097B2]"
              />
            ) : (
              <Link
                href="/auth/login"
                className="text-lg font-serif text-[#0097B2]"
                onClick={handleMenuClose}
              >
                Login
              </Link>
            )}
            <FaShoppingCart
              onClick={() => {
                setCartOpen(true);
                handleMenuClose();
              }}
              className="cursor-pointer text-lg text-[#0097B2]"
            />
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      {cartOpen && (
        <CartSidebar
          isOpen={cartOpen}
          closeCart={() => setCartOpen(false)}
          cartItems={cartItems}
          removeFromCart={(itemId) => {
            setCartItems(cartItems.filter((item) => item.id !== itemId));
          }}
          updateQuantity={(itemId, quantity) => {
            setCartItems(
              cartItems.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: Number(quantity) }
                  : item
              )
            );
          }}
        />
      )}
    </>
  );
};

export default Navbar;
