import React from 'react';
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8">
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
                <Link href="/" className="hover:underline">
                  Naslovna
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/shop" className="hover:underline">
                  Prodavnica
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/contact" className="hover:underline">
                  Kontakt
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/account" className="hover:underline">
                  Moj nalog
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/auth/login" className="hover:underline">
                  Prijava
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/auth/register" className="hover:underline">
                  Registracija
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h5 className="font-bold mb-2">Kontaktiraj nas</h5>
            <p className="text-sm">
              Podgorica, 81000
              <br />
              Telefon: +38269851872
              <br />
              E-mail: contact@ladimood.com
            </p>
          </div>
          <div className="w-full md:w-1/4">
            <h5 className="font-bold mb-2">Pratite nas</h5>
            <div className="flex space-x-4">
              <Link
                href="https://www.instagram.com/ladimood.store/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400"
                aria-label="Instagram"
              >
                <FaInstagram className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-white">
          © {new Date().getFullYear()} Ladimood. Sva prava rezervisana.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
