"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { registerUser } from '@/api/auth/axios';
import { getCurrentUser } from '@/api/account/axios';  // Import your registerUser function
import { UserCreate } from '@/app/types/types'; // Import UserCreate type for proper type-checking
import axios from 'axios'; // For handling Axios errors

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false); // New state to track loading
    const router = useRouter();

    // Check if the user is already logged in and redirect if they have an access token
    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            // Check if the token is valid by fetching user info
            getCurrentUser()
                .then((user) => {
                    if (user) {
                        setIsLoggedIn(true);
                        router.push('/account');  // Redirect to /account if the user is already logged in
                    }
                })
                .catch(() => {
                    setIsLoggedIn(false); // In case of error or invalid token
                });
        }
    }, [router]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Basic client-side validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true); // Set loading to true when request starts

        const userData: UserCreate = {
            email,
            password,
            full_name: fullName,
            phone_number: phoneNumber, // Assuming phone_number is required in the backend
        };

        try {
            await registerUser(userData); // Using your Axios registerUser function
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                router.push('/auth/login'); // Redirect to login after successful registration
            }, 2000);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Handle the error response from the server
                    setError(error.response.data.detail || 'Registration failed. Please try again.');
                } else {
                    // Handle network or server issues
                    setError('Failed to connect to the server. Please try again later.');
                }
            } else {
                // Handle other unexpected errors
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false); // Set loading to false when request completes
        }
    };

    return (
        <div className="overflow-hidden flex items-center justify-center bg-blue-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl transform transition-all duration-500 hover:shadow-3xl">
                <h1 className="text-4xl font-extrabold text-[#0097B2] text-center">Register</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[#0097B2] font-semibold">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 mt-2 border border-[#0097B2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097B2] transition duration-300 text-black"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[#0097B2] font-semibold">Phone Number</label>
                        <PhoneInput
                            country={'me'} // Default to Montenegro
                            value={phoneNumber}
                            onChange={(phone) => setPhoneNumber(phone)}
                            containerClass="w-full"
                            inputClass="w-full px-4 py-3 mt-2 border border-[#0097B2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097B2] transition duration-300 text-black"
                            buttonClass="bg-white"
                            dropdownClass="bg-white custom-dropdown"
                            searchClass="custom-search text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-[#0097B2] font-semibold">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 mt-2 border border-[#0097B2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097B2] transition duration-300 text-black"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[#0097B2] font-semibold">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 mt-2 border border-[#0097B2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097B2] transition duration-300 text-black"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[#0097B2] font-semibold">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 mt-2 border border-[#0097B2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097B2] transition duration-300 text-black"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {success && <p className="text-green-500 text-center">{success}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 font-bold text-white bg-[#0097B2] rounded-lg hover:bg-[#007A90] focus:outline-none focus:ring-4 focus:ring-[#0097B2] transition duration-300 shadow-lg hover:shadow-xl"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="text-center text-[#0097B2]">
                    Already have an account?{' '}
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="text-[#0097B2] hover:underline focus:outline-none"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;
