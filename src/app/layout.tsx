import React, { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import Navbar from '@/components/Layout/Header/Navbar';
import Footer from '@/components/Layout/Footer/Footer';
import { Providers } from '@/components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
});

const siteDescription =
  'Ladimood vam donosi visokokvalitetne majice i odjeću inspirisanu crnogorskom kulturom. Nosi svoje korijene s ponosom i izrazi svoj jedinstveni stil.';

export const metadata: Metadata = {
  title: 'Ladimood | Podgorički brend',
  description: siteDescription,
  keywords: [
    'Ladimood',
    'crnogorski brend',
    'kultne podgoričke majice',
    'Crna Gora na majici',
    'podgorički brend',
    'Podgorica',
    'obilježja Podgorice',
    'visokokvalitetne majice',
    'jedinstveni dizajn',
    'ladi mood',
    'moda Crna Gora',
    'Balkanski brendovi',
    'kul majice',
    'balkanske izreke',
    'balkanske fore',
    'balkanske šale',
  ],
  authors: [{ name: 'Ladimood' }],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.ladimood.com',
  },
  icons: {
    icon: [{ url: '/images/icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'Ladimood | Podgorički brend',
    description:
      'Otkrijte jedinstvenu odjeću inspirisanu crnogorskom kulturom, forama i ležernim stilom života uz Ladimood. Naše majice spajaju naše šale, izreke, vrhunski dizajn i kvalitetne materijale.',
    url: 'https://www.ladimood.com',
    siteName: 'Ladimood',
    type: 'website',
    images: ['/images/icon.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ladimood | Podgorički brend',
    description:
      'Ladimood je podgorički brend koji nudi jedinstvene, visokokvalitetne majice inspirisane crnogorskim forama i stilom života. Nosi obilježja svoje kulture i dijeli svoj stil.',
    images: ['/images/icon.png'],
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full w-full`}>
      <body className="flex min-h-dvh w-full flex-col bg-background text-foreground antialiased">
        <Providers>
          <Navbar />
          <main className="w-full flex-grow bg-background pt-20 md:pt-24">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
