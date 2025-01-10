import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CallToOrderProps } from '@/app/types/types';

const CallToOrder: React.FC<CallToOrderProps> = ({ cartItems, onCancel }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!cartItems || cartItems.length === 0) {
    return <div className="text-center text-gray-600">Your cart is empty.</div>;
  }

  const totalAmount = cartItems.reduce((total, item) => {
    const price = item.product?.price || 0; 
    return total + price * item.quantity;
  }, 0);

  const handleProceedToConfirmation = () => {
    const orderData = {
      items: cartItems.map((item) => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
        },
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      })),
      total: totalAmount,
    };
  
    console.log('Order Data:', orderData); // Debugging
    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    router.push('/confirmation'); // Navigate to confirmation page
  };
  
  
  return (
    <div className="p-4 bg-white shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Ready to Order?</h2>
          <p className="text-gray-600">You have {cartItems.length} items in your cart.</p>
          <p className="text-gray-800 font-bold">Total: €{totalAmount.toFixed(2)}</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleProceedToConfirmation}
            disabled={isLoading}
            className={`px-4 py-2 bg-[#0097B2] text-white rounded-md hover:bg-teal-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Proceed to Confirmation
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallToOrder;
