'use client';

import React, { ReactNode } from 'react';
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

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full w-full`}>
      <head>
        <title>Ladimood | Podgorički brend</title>
        <meta
          name="description"
          content="Ladimood vam donosi visokokvalitetne majice i odjeću inspirisanu crnogorskom kulturom. Nosi svoje korijene s ponosom i izrazi svoj jedinstveni stil."
        />
        <meta
          name="keywords"
          content="Ladimood, crnogorski brend, kultne podgoričke majice, Crna Gora na majici, podgorički brend, Podgorica, obilježja Podgorice, visokokvalitetne majice, jedinstveni dizajn, ladi mood, moda Crna Gora, Balkanski brendovi, kul majice, balkanske izreke, balkanske fore, balkanske šale"
        />
        <meta name="author" content="Ladimood" />
        <meta property="og:title" content="Ladimood | Podgorički brend" />
        <meta
          property="og:description"
          content="Otkrijte jedinstvenu odjeću inspirisanu crnogorskom kulturom, forama i ležernim stilom života uz Ladimood. Naše majice spajaju naše šale, izreke, vrhunski dizajn i kvalitetne materijale."
        />
        <meta property="og:image" content="/images/icon.png" />
        <meta property="og:url" content="https://www.ladimood.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ladimood | Podgorički brend" />
        <meta
          name="twitter:description"
          content="Ladimood je podgorički brend koji nudi jedinstvene, visokokvalitetne majice inspirisane crnogorskim forama i stilom života. Nosi obilježja svoje kulture i dijeli svoj stil."
        />
        <meta name="twitter:image" content="/images/icon.png" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.ladimood.com" />
        <link rel="icon" href="/images/icon2.svg" sizes="any" />
      </head>
      <body className="flex min-h-dvh w-full flex-col bg-background text-foreground antialiased">
        <Providers>
          <Navbar />
          <main className="w-full flex-grow bg-background pt-[120px] md:pt-[100px]">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
