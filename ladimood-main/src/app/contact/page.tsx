"use client";
import React from "react";
import ContactForm from "@/components/Contact/ContactForm";

const ContactPage: React.FC = () => {
  return (
    <>
      <head>
        <title>Kontaktirajte nas - Ladimood</title>
        <meta
          name="description"
          content="Kontaktirajte Ladimood za upite, podršku ili mogućnosti saradnje. Radujemo se vašem javljanju!"
        />
        <meta
          name="keywords"
          content="Kontakt Ladimood, Ladimood podrška, korisnička služba Ladimood, upiti, saradnja, crnogorska moda, Crnogorska moda"
        />
        <meta name="author" content="Ladimood" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Kontaktirajte nas - Ladimood" />
        <meta
          property="og:description"
          content="Obratite se Ladimoodu za bilo kakva pitanja ili povratne informacije. Tu smo da pomognemo!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ladimood.com/contact" />
        <meta property="og:image" content="/images/contact-meta-image.jpg" />
        <meta property="og:locale" content="sr_ME" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:site_name" content="Ladimood" />
      </head>
      <div className="min-h-screen bg-white py-12 px-6">
          <ContactForm />
      </div>
    </>
  );
};

export default ContactPage;
