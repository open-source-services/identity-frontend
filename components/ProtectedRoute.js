'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, requiredScope, requiredRole, requiredPermission }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin');
      return;
    }

    if (!loading && isAuthenticated && user) {
      // Check scope requirement
      if (requiredScope && !user.scopes?.includes(requiredScope)) {
        router.push('/unauthorized');
        return;
      }

      // Check role requirement
      if (requiredRole && !user.roles?.includes(requiredRole)) {
        router.push('/unauthorized');
        return;
      }

      // Check permission requirement
      if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, isAuthenticated, user, router, requiredScope, requiredRole, requiredPermission]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}