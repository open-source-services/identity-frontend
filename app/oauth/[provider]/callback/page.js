'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, Button, Spinner } from '@heroui/react';
import { setTokens, getUserFromToken } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { redirectToReturnUrl } from '@/lib/redirect';

export default function OAuthCallback({ params }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // The backend should handle the callback and return tokens
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/oauth/${params.provider}/callback?code=${code}&state=${state}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('OAuth callback failed');
        }

        const data = await response.json();
        console.log('OAuth callback response:', data);
        
        // Handle nested token structure from backend
        const tokens = data.data?.tokens || data.tokens || data;
        const { access_token, refresh_token } = tokens;

        if (!access_token || !refresh_token) {
          throw new Error('Invalid OAuth response: missing tokens');
        }

        setTokens(access_token, refresh_token);
        const userData = getUserFromToken();
        login(userData);
        
        // Redirect to return URL or profile
        if (!redirectToReturnUrl()) {
          router.push('/profile');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, params.provider, router, login]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-8">
            <Spinner size="lg" className="mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-2">
              Completing Authentication
            </h2>
            <p className="text-sm text-default-500">
              Signing you in with {params.provider}...
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-8 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Authentication Failed
              </h2>
              <p className="mt-2 text-sm text-danger">{error}</p>
            </div>
            <Button
              color="primary"
              size="lg"
              onPress={() => router.push('/signin')}
              className="w-full"
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return null;
}