"use client";
import React from 'react';
import ContactForm from '@/components/Contact/ContactForm';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactPage;
