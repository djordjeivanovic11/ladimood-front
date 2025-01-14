"use client";
import React, { ReactNode } from "react";
import { Inter } from "next/font/google";
import Navbar from "@/components/Layout/Header/Navbar";
import Footer from "@/components/Layout/Footer/Footer";
import "../styles/globals.css";
import { AuthProvider } from "@/components/Authentication/HOC/authContext";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en" className={`${inter.className} h-full w-full`}>
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
        {/* Favicon */}
        <link rel="icon" href="/images/icon2.svg" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" />
      </head>
      <body className="h-full w-full flex flex-col bg-gray-50">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow w-full bg-white"><AuthProvider>{children}</AuthProvider></main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;
