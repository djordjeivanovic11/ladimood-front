"use client";
import React, { ReactNode } from "react";
import { Inter } from "next/font/google";
import { useTranslation } from 'react-i18next';
import Navbar from "@/components/Layout/Header/Navbar";
import Footer from "@/components/Layout/Footer/Footer"
import '../i18n';
import '../styles/globals.css'; 

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <html lang="en" className={`${inter.className} h-full w-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="" />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href="/images/icon.png" />
        <title></title>
      </head>
      <body className="h-full w-full flex flex-col">
        <Navbar />
        <main className=" flex-grow w-full relative"> 
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;