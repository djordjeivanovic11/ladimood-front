"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OrderConfirmation from '@/components/Order/FinalizeOrder/OrderConfirmation';
import ReferralPopup from '@/components/Order/FinalizeOrder/ReferralPopup';
import { getCurrentUser } from '@/api/account/axios';

const ConfirmationPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = useParams();
  const [showReferralPopup, setShowReferralPopup] = useState(true);
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
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
        {orderId ? (
          <OrderConfirmation />
        ) : (
          <p>Loading...</p>
        )}

        {showReferralPopup && (
          <ReferralPopup onClose={() => setShowReferralPopup(false)} />
        )}
      </div>
    </div>
  );
};

export default ConfirmationPage;
