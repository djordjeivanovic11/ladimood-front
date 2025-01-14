"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserDetails } from "@/api/account/axios";
import { logoutUser } from "@/api/auth/axios";
import { User } from "@/app/types/types";

const UserDetails: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    getUserDetails()
      .then(setUser)
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
      // Clear tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.reload();
      router.replace("/");
    } catch (error) {
      alert("Failed to log out. Please try again.");
      console.error("Logout failed", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center text-gray-500 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0097B2]"></div>
        <p className="ml-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 sm:p-8 max-w-lg mx-auto mt-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {user.full_name}!</h2>
          <p className="text-gray-500 text-sm">Manage your account details below</p>
        </div>

        {/* User Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name:</p>
            <p className="text-lg font-semibold text-gray-800 break-words">{user.full_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email:</p>
            <p className="text-lg font-semibold text-gray-800 break-words">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone:</p>
            <p className="text-lg font-semibold text-gray-800 break-words">{user.phone_number}</p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="bg-[#0097B2] text-white font-semibold py-3 px-8 rounded-md shadow-md hover:bg-[#007A90] hover:shadow-lg focus:ring-2 focus:ring-[#0097B2] transition-all duration-300 w-full"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
