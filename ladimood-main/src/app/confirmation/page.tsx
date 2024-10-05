"use client";
import React, { useState } from 'react';
import {useRouter} from 'next/navigation'; 
import { useEffect } from 'react';
import { getCurrentUser } from '@/api/account/axios';
import ReferralPopup from '@/components/Order/FinalizeOrder/ReferralPopup'; // Import the ReferralPopup component

const ReferralPage: React.FC = () => {
  const router = useRouter();
  const [showReferralPopup, setShowReferralPopup] = useState(true); // State to control the visibility of the referral popup
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        getCurrentUser()
            .then((user) => {
                if (!user) {
                    setIsLoggedIn(false);
                    router.push('/auth/login'); 
                }
            })
            .catch(() => {
                setIsLoggedIn(false);
            });
    }
}, [router]);
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {showReferralPopup ? (
        <ReferralPopup onClose={() => setShowReferralPopup(false)} />
      ) : (
        <div className="text-center">
          <h1 className="text-3xl font-bold">Thank you for referring your friends!</h1>
          <button
            className="mt-6 bg-[#0097B2] text-white px-6 py-2 rounded-lg shadow hover:bg-[#007A90] transition duration-300"
            onClick={() => setShowReferralPopup(true)}
          >
            Refer More Friends
          </button>
        </div>
      )}
    </div>
  );
};

export default ReferralPage;
