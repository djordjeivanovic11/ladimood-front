'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/api/auth/axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { completeAuthCallback } from '@/lib/supabase-auth-callback';
import { isPkceVerifierMissingError } from '@/lib/supabase-auth-errors';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const prepareRecoverySession = async () => {
      try {
        const { session, error: callbackError } = await completeAuthCallback();

        if (callbackError) {
          if (isPkceVerifierMissingError(callbackError)) {
            setError(
              'Link za reset lozinke mora biti otvoren u istom browseru gdje je reset pokrenut. Zatražite novi reset link i otvorite ga u istom browseru.'
            );
            return;
          }
          setError(callbackError.message);
          return;
        }

        if (!session) {
          setError('Link za reset je nevažeći ili je istekao.');
          return;
        }

        setSessionReady(true);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Link za reset je nevažeći ili je istekao.';
        setError(message);
      }
    };

    void prepareRecoverySession();
  }, []);

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError('Nove lozinke se ne poklapaju.');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await resetPassword(newPassword);
      setSuccess('Lozinka je uspješno promijenjena!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Reset lozinke nije uspio. Pokušajte ponovo.';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-[#0097B2] text-center">Nova lozinka</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#0097B2] font-semibold">Nova lozinka</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 mt-2 border border-[#0097B2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097B2] transition duration-300 text-black"
                placeholder="Unesite novu lozinku"
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
            <label className="block text-[#0097B2] font-semibold">Potvrdite novu lozinku</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3 mt-2 border border-[#0097B2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097B2] transition duration-300 text-black"
                placeholder="Potvrdite novu lozinku"
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
            disabled={!sessionReady}
            className="w-full px-4 py-3 font-bold text-white bg-[#0097B2] rounded-lg hover:bg-[#007A90] focus:outline-none focus:ring-4 focus:ring-[#0097B2] transition duration-300 shadow-lg hover:shadow-xl"
          >
            Promijeni lozinku
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
