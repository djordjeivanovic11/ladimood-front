"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserDetails } from '@/api/account/axios';
import { logoutUser } from '@/api/auth/axios';
import { User } from '@/app/types/types';

const UserDetails: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch the user details on component mount
  useEffect(() => {
    getUserDetails()
      .then(setUser)
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
  
      if (refreshToken) {
        // Call the logout API to invalidate the token on the server
        await logoutUser(refreshToken);
      } else {
        console.warn('No refresh token found');
      }
  
      // Clear tokens from localStorage regardless
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
  
      // Redirect the user to the homepage
      window.location.reload();
      router.push('/');
    } catch (error) {
      alert('Failed to log out. Please try again.');
      console.error('Logout failed', error);
    }
  };
  
  

  if (!user) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="bg-white border border-[#0097B2] rounded-lg shadow-md p-4 sm:p-6 max-w-lg mx-4 sm:mx-auto mt-8 sm:mt-12">
      <div className="space-y-4 sm:space-y-6">
        {/* User Details */}
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm sm:text-lg font-medium text-[#0097B2]">Name</p>
          <p className="text-base sm:text-lg font-semibold text-gray-800 mt-1 sm:mt-0">{user.full_name}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm sm:text-lg font-medium text-[#0097B2]">Email</p>
          <p className="text-base sm:text-lg font-semibold text-gray-800 mt-1 sm:mt-0">{user.email}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm sm:text-lg font-medium text-[#0097B2]">Phone Number</p>
          <p className="text-base sm:text-lg font-semibold text-gray-800 mt-1 sm:mt-0">{user.phone_number}</p>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-6 sm:mt-8 text-center">
        <button
          onClick={handleLogout}
          className="bg-[#0097B2] text-white font-semibold py-2 px-6 rounded-md w-full sm:w-auto hover:bg-[#007A90] transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserDetails;
