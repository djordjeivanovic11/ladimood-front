"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserDetails from '@/components/Account/UserDetails';
import AddressManager from '@/components/Account/AddressManager';
import OrderHistory from '@/components/Account/Order/OrderHistory';
import Wishlist from '@/components/Account/Wishlist';
import Cart from '@/components/Account/Cart';
import Newsletter from '@/components/Frontpage/Newsletter';
import { getCurrentUser } from '@/api/account/axios';

const AccountPage: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state to prevent flickering
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            // Validate the token by fetching user info
            getCurrentUser()
                .then((user) => {
                    if (user) {
                        setIsLoggedIn(true); // User is authenticated
                        setIsLoading(false);
                    } else {
                        // Invalid token or no user, redirect to login
                        router.push('/auth/login');
                    }
                })
                .catch(() => {
                    // Error occurred, redirect to login
                    router.push('/auth/login');
                });
        } else {
            // No access token found, redirect to login
            router.push('/auth/login');
        }
    }, [router]);

    // Render loading screen while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-xl text-gray-500">Checking authentication...</p>
            </div>
        );
    }

    // Render account page content only if the user is logged in
    if (!isLoggedIn) {
        return null; // Prevent rendering content if not logged in
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl w-full space-y-8">
                    <h1 className="text-5xl font-extrabold text-[#0097B2] text-center mb-12">My Account</h1>
                    
                    <div className="bg-white shadow-lg rounded-2xl p-10 space-y-16">
                        {/* User Details and Address */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div>
                                <h2 className="text-3xl font-bold text-[#0097B2] mb-6">Account Details</h2>
                                <UserDetails />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-[#0097B2] mb-6">Address Information</h2>
                                <AddressManager />
                            </div>
                        </div>

                        {/* Order History */}
                        <div>
                            <h2 className="text-3xl font-bold text-[#0097B2] mb-6">Order History</h2>
                            <OrderHistory />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Wishlist */}
                            <div>
                                <h2 className="text-3xl font-bold text-[#0097B2] mb-6">Wishlist</h2>
                                <Wishlist />
                            </div>

                            {/* Cart */}
                            <div>
                                <h2 className="text-3xl font-bold text-[#0097B2] mb-6">Shopping Cart</h2>
                                <Cart />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Newsletter />
        </>
    );
};

export default AccountPage;
