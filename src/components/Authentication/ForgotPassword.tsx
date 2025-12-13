"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { forgotPassword } from '@/api/auth/axios'; 

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const data = await forgotPassword(email);

            setSuccess(data.message || 'If this email is registered, you will receive instructions to reset your password.');
            setTimeout(() => {
                router.push('/auth/login'); 
            }, 3000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to send reset instructions. Please try again.';
            setError(errorMessage);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl transform transition-all duration-500 hover:shadow-3xl">
                <h1 className="text-4xl font-extrabold text-[#0097B2] text-center">Forgot Password</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {success && <p className="text-green-500 text-center">{success}</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 font-bold text-white bg-[#0097B2] rounded-lg hover:bg-[#007A90] focus:outline-none focus:ring-4 focus:ring-[#0097B2] transition duration-300 shadow-lg hover:shadow-xl"
                    >
                        Send Reset Instructions
                    </button>
                </form>
                <p className="text-center text-[#0097B2]">
                    Remember your password?{' '}
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

export default ForgotPassword;
