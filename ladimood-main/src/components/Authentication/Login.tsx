"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { getCurrentUser } from '@/api/account/axios';  

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const router = useRouter();

    

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
          getCurrentUser()
            .then((user) => {
              if (user) {
                setIsLoggedIn(true);
                router.push('/account'); 
              }
            })
            .catch(() => {
              setIsLoggedIn(false);  
            });
        }
      }, [router]);
      
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    username: email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('access_token', data.access_token);
                router.push('/account'); 
                // page reload to update the user state
                window.location.reload();   
                
            } else {
                setError(data.detail || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            setError('An unexpected error occurred');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl transform transition-all duration-500 hover:shadow-3xl">
                <h1 className="text-4xl font-extrabold text-[#0097B2] text-center">Login</h1>
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
                    <div>
                        <label className="block text-[#0097B2] font-semibold">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 mt-2 border border-[#0097B2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097B2] transition duration-300 text-black"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.push('/auth/forgot-password')}
                            className="text-[#0097B2] hover:underline focus:outline-none"
                        >
                            Forgot Password?
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 font-bold text-white bg-[#0097B2] rounded-lg hover:bg-[#007A90] focus:outline-none focus:ring-4 focus:ring-[#0097B2] transition duration-300 shadow-lg hover:shadow-xl"
                    >
                        Login
                    </button>
                </form>
                <p className="text-center text-[#0097B2]">
                    Don&apos;t have an account?{' '}
                    <button
                        onClick={() => router.push('/auth/register')}
                        className="text-[#0097B2] hover:underline focus:outline-none"
                    >
                        Register
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
