import React, { useState } from 'react';
import { FaUser, FaUserCheck } from 'react-icons/fa';
import { sendReferrals } from '@/api/account/axios';
import { MessageResponse } from '@/app/types/types';

interface ReferralPopupProps {
  onClose: () => void; 
}

const ReferralPopup: React.FC<ReferralPopupProps> = ({ onClose }) => {
  const [referrals, setReferrals] = useState([
    { name: '', email: '' },
    { name: '', email: '' },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (index: number, field: string, value: string) => {
    const updatedReferrals = [...referrals];
    updatedReferrals[index] = { ...updatedReferrals[index], [field]: value };
    setReferrals(updatedReferrals);
  };

  const handleSubmit = async () => {
    try {
      // Filter out empty referral entries
      const validReferrals = referrals.filter(referral => referral.name && referral.email);
      if (validReferrals.length === 0) {
        setError('Molimo vas da unesete bar jednu preporuku.');
        return;
      }

      // Call the API to send referrals
      const response: MessageResponse = await sendReferrals(validReferrals);

      if (response.message === 'Referral emails sent successfully.') {
        setSubmitted(true); 
        setError(null);

        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError('Nije uspjelo slanje preporuka. Pokušajte ponovo.');
      }
    } catch (error) {
      console.error('Failed to send referrals:', error);
      setError('Nije uspjelo slanje preporuka. Pokušajte ponovo.');
    }
  };

  return (
    <div className="p-8 bg-white shadow-lg rounded-lg text-center transform transition-transform duration-300 scale-100 w-96">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Preporučite Prijatelje</h2>
      <p className="text-gray-700 mb-6">
        Podijelite Ladimood sa svojim prijateljima i omogućite im da otkriju naš brend!
      </p>

      {referrals.map((referral, index) => (
        <div key={index} className="mb-4">
          <div className="flex items-center mb-2 space-x-2">
            {referral.name ? (
              <FaUserCheck className="text-[#0097B2] text-2xl" />
            ) : (
              <FaUser className="text-gray-500 text-2xl" />
            )}
            <span className="text-gray-800 font-semibold">
              {referral.name ? referral.name : `Osoba ${index + 1}`}
            </span>
          </div>
          <input
            type="text"
            placeholder="Ime i Prezime"
            value={referral.name}
            onChange={(e) => handleChange(index, 'name', e.target.value)}
            className="w-full px-3 py-2 mb-2 border rounded-md text-gray-900"
          />
          <input
            type="email"
            placeholder="Email Adresa"
            value={referral.email}
            onChange={(e) => handleChange(index, 'email', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-gray-900"
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-[#0097B2] text-white py-2 rounded-lg shadow hover:bg-[#007A90] transition duration-300"
        disabled={submitted}
      >
        Pošaljite Preporuke
      </button>
      <button
        onClick={onClose}
        className="mt-4 w-full text-[#0097B2] py-2 rounded-lg hover:underline transition duration-300"
      >
        Preskoči
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}
      {submitted && (
        <p className="mt-4 text-green-600 font-semibold">
          Emailovi su poslati vašim prijateljima!
        </p>
      )}
    </div>
  );
};

export default ReferralPopup;
