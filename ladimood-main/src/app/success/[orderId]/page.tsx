'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle } from 'react-icons/fa';
import Image from 'next/image';
import withAuth from "@/components/Authentication/HOC/withAuth";
import ReferralPopup from '@/components/Order/Order/ReferralPopup';

const SuccessPage: React.FC = () => {
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [showReferral, setShowReferral] = useState(false);

  useEffect(() => {
    const storedOrderData = localStorage.getItem('orderDetails');
    if (storedOrderData) {
      setOrder(JSON.parse(storedOrderData));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!order) {
    return <div className="text-center text-gray-600 mt-10">Učitavanje vaše narudžbe...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-white p-10 rounded-lg shadow-lg flex flex-col lg:flex-row lg:space-x-8">
        {/* Thank You Section */}
        <div className="lg:w-1/2">
          <div className="text-center lg:text-left">
            <FaCheckCircle className="text-[#0097B2] text-6xl mx-auto lg:mx-0 mb-6" />
            <h2 className="text-3xl font-bold text-black mb-4">
              Hvala Vam na Vašoj porudžbini!
            </h2>
            <p className="text-gray-700 mb-6">
              Srećni smo što ste odabrali Ladimood. Vaša porudžbina je uspješno zabilježena!
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Email sa detaljima porudžbine je poslat na vašu email adresu. U međuvremenu, ovdje je rezime vaše kupovine:
            </p>
          </div>

          {/* Order Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#0097B2] mb-4">Vaši Artikli:</h3>
            <ul className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <li
                  key={`${item.product_id}-${index}`}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src={item.image || '/images/default-product.jpg'}
                      alt={item.name || 'Proizvod'}
                      className="w-16 h-16 rounded-md object-cover border"
                      width={64}
                      height={64}
                    />
                    <div>
                      <p className="font-medium text-black">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × €{item.price.toFixed(2)} | Size: {item.size}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex text-black justify-end">
              <p className="text-lg text-black font-bold">Total: €{order.total_price.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Referral Section */}
        <div className="lg:w-1/2 p-6 rounded-lg">
          <ReferralPopup onClose={() => setShowReferral(false)} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-8">
        <button
          onClick={() => router.push('/account')}
          className="px-5 py-2 bg-[#0097B2] text-white rounded-md shadow hover:bg-[#007A90] transition-all duration-300"
        >
          Idi na Profil
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-all duration-300"
        >
          Povratak na Početnu
        </button>
      </div>
    </div>
  );
};

export default withAuth(SuccessPage);