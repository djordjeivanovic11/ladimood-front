"use client";
import React from "react";
import ContactForm from "@/components/Contact/ContactForm";

const ContactPage: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-white py-12 px-6">
          <ContactForm />
      </div>
    </>
  );
};

export default ContactPage;
