import React from 'react';
import Link from 'next/link';
import {  FaInstagram } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0097B2] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h4 className="font-bold mb-2">Ladimood</h4>
            <p className="text-md">Śedjenje je opuč pri ležanju</p>
          </div>
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h5 className="font-bold mb-2">Linkovi</h5>
            <ul>
              <li className="mb-2">
                <Link href="/" passHref>
                  <span className="hover:underline cursor-pointer">Naslovna</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/shop" passHref>
                  <span className="hover:underline cursor-pointer">Šopinguj</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/auth/login" passHref>
                  <span className="hover:underline cursor-pointer">Login</span>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/cart" passHref>
                  <span className="hover:underline cursor-pointer">Korpa</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h5 className="font-bold mb-2">Kontaktiraj nas</h5>
            <p className="text-sm">
              Ulica 13.jula 2<br />
              Podgorica, 81000<br />
              Phone: +38269851872<br />
              Email: contact@ladimood.com
            </p>
          </div>
          <div className="w-full md:w-1/4">
            <h5 className="font-bold mb-2">Follow Us</h5>
            <div className="flex space-x-4">
              <Link href="https://www.instagram.com/ladimood.store/" passHref>
                <span className="hover:text-gray-400 cursor-pointer">
                  <FaInstagram className="w-6 h-6" />
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-white">
          © 2024 Ladimood. Sva prava rezervisana.
        </div>
      </div>
    </footer>
  );
};

export default Footer;