import React, { useState } from 'react';
import { FaUser, FaUserCheck } from 'react-icons/fa';
import { sendReferrals } from '@/api/account/axios';
import { MessageResponse } from '@/app/types/types';
import { toast } from '@/lib/toast';

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
      const validReferrals = referrals.filter((referral) => referral.name && referral.email);
      if (validReferrals.length === 0) {
        setError('Molimo vas da unesete bar jednu preporuku.');
        return;
      }

      // Call the API to send referrals
      const response: MessageResponse = await sendReferrals(validReferrals);

      if (response.message === 'Referral emails sent successfully.') {
        setSubmitted(true);
        setError(null);
        toast.success('Poslato prijateljima!');

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError('Nije uspjelo slanje preporuka. Pokušajte ponovo.');
      }
    } catch (error) {
      console.error('Failed to send referrals:', error);
      setError('Nije uspjelo slanje preporuka. Pokušajte ponovo.');
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-5 text-center shadow-lg transition-transform duration-300 sm:p-8">
      <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">Preporučite Prijatelje</h2>
      <p className="mb-6 text-sm text-gray-700 sm:text-base">
        Podijelite Ladimood sa svojim prijateljima i omogućite im da otkriju naš brend!
      </p>

      {referrals.map((referral, index) => (
        <div key={index} className="mb-4">
          <div className="mb-2 flex items-center space-x-2">
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
            className="mb-2 min-h-11 w-full rounded-md border px-3 py-2 text-gray-900"
          />
          <input
            type="email"
            placeholder="E-mail adresa"
            value={referral.email}
            onChange={(e) => handleChange(index, 'email', e.target.value)}
            className="min-h-11 w-full rounded-md border px-3 py-2 text-gray-900"
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="mt-6 min-h-11 w-full rounded-lg bg-[#0097B2] py-2 text-white shadow transition duration-300 hover:bg-[#007A90]"
        disabled={submitted}
      >
        Pošaljite Preporuke
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default ReferralPopup;
