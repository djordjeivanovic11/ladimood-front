"use client";
import React, { ReactNode } from "react";
import { Inter } from "next/font/google";
import Navbar from "@/components/Layout/Header/Navbar";
import Footer from "@/components/Layout/Footer/Footer";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {

  return (
    <html lang="en" className={`${inter.className} h-full w-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Your website description here" />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href="/images/icon.png" />
        <title>Ladimood | Podgorički brend</title>
      </head>
      <body className="h-full w-full flex flex-col bg-gray-50">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow w-full bg-white">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;
