"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/api/auth/axios';  
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);  
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match.');
            return;
        }

        setError('');
        setSuccess('');

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token'); 

            if (!token) {
                setError('Invalid or missing reset token.');
                return;
            }

            
            const data = await resetPassword({ token, new_password: newPassword });
            console.log(data);
            setSuccess('Password reset successfully!');
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to reset password. Please try again.';
            setError(errorMessage);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl">
                <h1 className="text-4xl font-extrabold text-[#0097B2] text-center">Reset Password</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[#0097B2] font-semibold">New Password</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 mt-2 border border-[#0097B2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097B2] transition duration-300 text-black"
                                placeholder="Enter new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={toggleNewPasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 focus:outline-none"
                            >
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[#0097B2] font-semibold">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full px-4 py-3 mt-2 border border-[#0097B2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097B2] transition duration-300 text-black"
                                placeholder="Confirm new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 focus:outline-none"
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {success && <p className="text-green-500 text-center">{success}</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 font-bold text-white bg-[#0097B2] rounded-lg hover:bg-[#007A90] focus:outline-none focus:ring-4 focus:ring-[#0097B2] transition duration-300 shadow-lg hover:shadow-xl"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
