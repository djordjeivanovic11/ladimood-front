"use client";
import React from "react";
import UserDetails from "@/components/Account/UserDetails";
import AddressManager from "@/components/Account/AddressManager";
import OrderHistory from "@/components/Account/Order/OrderHistory";
import Wishlist from "@/components/Account/Wishlist";
import Cart from "@/components/Account/Cart";
import Newsletter from "@/components/Frontpage/Newsletter";
import withAuth from "@/components/Authentication/HOC/withAuth";

const AccountPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-6xl md:text-5xl sm:text-3xl m-5 font-extrabold text-[#0097B2] text-center mb-12 sm:mb-16">
        My Account
      </h1>

      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
        {/* User Details and Address */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <UserDetails />
          </div>
          <div>
            <AddressManager />
          </div>
        </div>

        {/* Order History */}
        <div>
          <OrderHistory />
        </div>

        {/* Wishlist and Cart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Wishlist />
          </div>
          <div>
            <Cart />
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mt-16">
        <Newsletter />
      </div>
    </div>
  );
};

export default withAuth(AccountPage);
