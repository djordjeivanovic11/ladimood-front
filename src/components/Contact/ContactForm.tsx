import React, { useState } from 'react';
import { submitContactForm } from '@/api/management/axios';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { normalizePhoneNumber } from '@/lib/phone';

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

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
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setAttachment(null);
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setErrorMessage('Fajl je prevelik. Maksimalna veličina je 25 MB.');
      e.currentTarget.value = '';
      setAttachment(null);
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMessage('Nepodržan tip fajla. Otpremite JPG, PNG, WEBP, GIF ili PDF.');
      e.currentTarget.value = '';
      setAttachment(null);
      return;
    }

    setErrorMessage(null);
    setAttachment(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await submitContactForm({
        ...formData,
        phone: normalizePhoneNumber(formData.phone),
        attachment,
      });
      setSuccessMessage(response.message);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        inquiry_type: '',
      });
      setAttachment(null);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Došlo je do greške. Pokušajte ponovo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl rounded-2xl">
      <h2 className="text-4xl md:text-5xl font-bold text-center text-[#0097B2] mb-4 md:mb-6">
        Kontaktirajte nas
      </h2>
      <p className="text-lg md:text-xl text-center text-gray-600 mb-8">
        Podijelite svoje misli ili ideje za kreativni dizajn majice!
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
              Ime
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Marko Marković"
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-gray-50 text-gray-800"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="marko@primjer.com"
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-gray-50 text-gray-800"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefon
          </label>
          <div className="mt-2">
            <PhoneNumberInput
              inputProps={{ id: 'phone', name: 'phone', required: true }}
              value={formData.phone}
              onChange={(phone) =>
                setFormData((prevData) => ({
                  ...prevData,
                  phone,
                }))
              }
            />
          </div>
        </div>
        <div>
          <label htmlFor="inquiry_type" className="block text-sm font-medium text-gray-700">
            Vrsta upita
          </label>
          <select
            id="inquiry_type"
            name="inquiry_type"
            value={formData.inquiry_type}
            onChange={handleInputChange}
            required
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-gray-50 text-gray-800"
          >
            <option value="">Odaberite vrstu upita</option>
            <option value="Opšti upit">Opšti upit</option>
            <option value="Podrška za proizvod">Podrška za proizvod</option>
            <option value="Prodajni upit">Prodajni upit</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Poruka
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Imam ideju za cool dizajn majice..."
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-gray-50 text-gray-800"
          ></textarea>
        </div>
        <div>
          <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">
            Prilog (opciono, max 25 MB)
          </label>
          <input
            type="file"
            id="attachment"
            name="attachment"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            onChange={handleAttachmentChange}
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2] bg-gray-50 text-gray-800"
          />
          {attachment && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-gray-700">
              <span className="truncate pr-2">{attachment.name}</span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-[#007a99] hover:text-[#005a70]"
              >
                Ukloni
              </button>
            </div>
          )}
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
            {isSubmitting ? 'Slanje...' : 'Pošalji'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
