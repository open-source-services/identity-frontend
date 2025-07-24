"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getReturnUrl, setReturnUrl, isValidReturnUrl } from "@/lib/redirect";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;

    const returnUrl = getReturnUrl();

    // Store valid return URL for after authentication
    if (returnUrl && isValidReturnUrl(returnUrl)) {
      setReturnUrl(returnUrl);
    }

    if (isAuthenticated) {
      // User is already authenticated, show profile
      router.push("/profile");
    } else {
      // User not authenticated, redirect to signin
      router.push("/signin");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
