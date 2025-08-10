'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { redirectToReturnUrl } from '@/lib/redirect';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('Processing...');
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return; // Prevent running multiple times
    
    const handleOAuthCallback = async () => {
      setProcessed(true); // Mark as processed immediately
      try {
        // Get tokens from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const userId = searchParams.get('user_id');
        const email = searchParams.get('email');
        const firstName = searchParams.get('first_name');
        const lastName = searchParams.get('last_name');

        if (!accessToken || !refreshToken) {
          throw new Error('Missing authentication tokens');
        }

        // Store tokens
        setTokens(accessToken, refreshToken);
        
        // Create user object for auth context
        const userData = {
          id: parseInt(userId),
          email,
          first_name: firstName,
          last_name: lastName,
        };

        // Update auth context
        login(userData);

        setStatus('Login successful! Redirecting...');

        // Redirect to return URL or profile page
        setTimeout(() => {
          if (!redirectToReturnUrl()) {
            router.push('/profile');
          }
        }, 1000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('Login failed. Please try again.');
        
        setTimeout(() => {
          router.push('/signin?error=oauth_failed');
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [processed, searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Completing Sign In
          </h1>
          <p className="text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  );
}