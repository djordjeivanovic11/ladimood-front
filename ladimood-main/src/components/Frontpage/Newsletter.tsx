'use client';

import React, { useState, useEffect } from 'react';
import { addToNewsletter } from '@/api/account/axios'; 

const SubscribeNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await addToNewsletter(email);
      setMessage({ type: 'success', text: 'Successfully subscribed to the newsletter!' });
      setEmail('');
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        setMessage({ type: 'error', text: 'This email is already registered.' });
      } else {
        setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center bg-white p-8 relative">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-800">Subscribe to our Newsletter</h2>
        <p className="mt-4 text-lg text-gray-600">
          Stay updated with the latest collections and exclusive offers.
        </p>
        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row justify-center items-center">
          <div className="w-full sm:max-w-md flex">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0097B2] focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className={`mt-4 sm:mt-0 sm:ml-4 px-6 py-3 bg-[#0097B2] text-white font-semibold rounded-full shadow-md hover:bg-[#007A90] transition-colors duration-300 flex items-center justify-center ${
              isSubmitting ? 'cursor-not-allowed opacity-75' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscribeNewsletter;
