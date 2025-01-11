import React, { useState } from 'react';
import { submitContactForm } from '@/api/management/axios';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiry_type: '',
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await submitContactForm(formData);
      setSuccessMessage(response.message);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        inquiry_type: '',
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl rounded-2xl">
      <h2 className="text-4xl md:text-5xl font-bold text-center text-[#0097B2] mb-4 md:mb-6">
        Get in Touch
      </h2>
      <p className="text-lg md:text-xl text-center text-gray-600 mb-8">
        Let us know your thoughts or share your creative t-shirt design ideas!
      </p>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="John Doe"
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-gray-50 text-gray-800"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="john@example.com"
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-gray-50 text-gray-800"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            placeholder="123-456-7890"
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-gray-50 text-gray-800"
          />
        </div>
        <div>
          <label htmlFor="inquiry_type" className="block text-sm font-medium text-gray-700">
            Inquiry Type
          </label>
          <select
            id="inquiry_type"
            name="inquiry_type"
            value={formData.inquiry_type}
            onChange={handleInputChange}
            required
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-gray-50 text-gray-800"
          >
            <option value="">Select Inquiry Type</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Product Support">Product Support</option>
            <option value="Sales Inquiry">Sales Inquiry</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="I have an idea for a cool t-shirt design..."
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-gray-50 text-gray-800"
          ></textarea>
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition-all duration-300 ${
              isSubmitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#0097B2] to-[#007a99] hover:to-[#005a70]'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
