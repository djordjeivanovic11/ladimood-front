"use client";
import React from "react";
import ContactForm from "@/components/Contact/ContactForm";

const ContactPage: React.FC = () => {
  return (
    <>
      <head>
        <title>Contact Us - Ladimood</title>
        <meta
          name="description"
          content="Get in touch with Ladimood for inquiries, support, or collaboration opportunities. We'd love to hear from you!"
        />
        <meta
          name="keywords"
          content="Contact Ladimood, ladimood support, ladimood customer service, inquiries, collaboration, Montenegro fashion, Crnogorska moda"
        />
        <meta name="author" content="Ladimood" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Contact Us - Ladimood" />
        <meta
          property="og:description"
          content="Reach out to Ladimood for any questions or feedback. We're here to help!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ladimood.com/contact" />
        <meta property="og:image" content="/images/contact-meta-image.jpg" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="sr_ME" />
        <meta property="og:site_name" content="Ladimood" />
      </head>
      <div className="min-h-screen bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0097B2] text-center mb-8">
            Contact Us
          </h1>
          <p className="text-lg text-gray-700 text-center mb-6">
            Have a question or suggestion? Fill out the form below, and we'll
            get back to you as soon as possible.
          </p>
          <ContactForm />
        </div>
      </div>
    </>
  );
};

export default ContactPage;
