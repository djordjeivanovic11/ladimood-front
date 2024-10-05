"use client";
import React, { useState } from 'react';
import { addToNewsletter } from '@/api/account/axios'; // Import the addToNewsletter function

const SubscribeNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Track the submit state
  const [message, setMessage] = useState(''); // For success or error messages

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Set submitting to true

    try {
      // Use the addToNewsletter function to send the email
      await addToNewsletter(email);

      // Success message and clear email input
      setMessage('Successfully subscribed to the newsletter!');
      setEmail(''); // Clear email input
    } catch (error: any) {
      // Handle the error, e.g., if the email is already registered
      if (error.response && error.response.status === 400) {
        setMessage('This email is already registered.');
      } else {
        setMessage('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-screen-md mx-auto text-center">
        <h2 className="text-3xl font-semibold text-[#0097B2] mb-4">Subscribe to our newsletter</h2>
        <p className="text-gray-500 mb-6">Be the first to know about new collections and exclusive offers.</p>
        {message && <p className={`mb-4 ${message.includes('error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
        <form onSubmit={handleSubmit} className="flex justify-center items-center">
          <div className="relative w-full max-w-lg">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 px-4 pr-32 text-gray-700 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0097B2]"
              required
            />
            <button
              type="submit"
              className="absolute top-0 right-0 h-full px-6 bg-[#0097B2] text-white font-semibold rounded-full hover:bg-[#007A90] focus:outline-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscribeNewsletter;
