"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Button, Divider, Spacer } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { authAPI } from "@/lib/api";
import { setTokens, getUserFromToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import {
  redirectToReturnUrl,
  addRedirectToRequest,
  getReturnUrl,
  setReturnUrl,
} from "@/lib/redirect";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (!redirectToReturnUrl()) {
        router.push("/profile");
      }
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Add redirect URL to request if available
      const requestData = addRedirectToRequest(formData);
      const response = await authAPI.login(requestData);

      console.log("Login response:", response.data);

      if (
        response.data?.data?.tokens?.access_token &&
        response.data?.data?.tokens?.refresh_token
      ) {
        const { access_token, refresh_token } = response.data.data.tokens;

        setTokens(access_token, refresh_token);
        const userData = getUserFromToken();
        login(userData);

        // Check if backend provided a redirect URL
        const backendRedirectUrl = response.data?.data?.redirect_url;
        if (backendRedirectUrl) {
          console.log(
            "Redirecting to backend provided URL:",
            backendRedirectUrl
          );
          window.location.href = backendRedirectUrl;
          return;
        }

        // Fallback to stored redirect URL or profile
        if (!redirectToReturnUrl()) {
          router.push("/profile");
        }
      } else {
        throw new Error("Invalid response format: missing tokens");
      }
    } catch (err) {
      console.error("Signin error:", err);
      if (err.response) {
        // Server responded with error status
        setError(
          err.response.data?.error ||
            err.response.data?.message ||
            `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        // Network error
        setError("Network error: Could not connect to server");
      } else {
        // Other error
        setError(err.message || "Sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      const response = await authAPI.getOAuthURL(provider);
      console.log("OAuth response:", response.data);
      const authUrl = response.data.auth_url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        setError(`${provider} OAuth not configured`);
      }
    } catch (err) {
      console.error("OAuth error:", err);
      setError(`${provider} sign in failed`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Company Name</h1>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="text-sm text-default-500 mt-2">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-danger-50 border border-danger-200">
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isRequired
              variant="bordered"
              size="lg"
            />

            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isRequired
              variant="bordered"
              size="lg"
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-default-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-default-400" />
                  )}
                </button>
              }
            />

            <Spacer y={2} />

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/signup"
              className="text-sm text-primary hover:text-primary-600"
            >
              Don't have an account? Sign up
            </Link>
          </div>

          <div className="relative">
            <Divider />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-sm text-default-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              size="lg"
              onPress={() => handleOAuthLogin("google")}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold border-0"
            >
              Google
            </Button>
            <Button
              size="lg"
              onPress={() => handleOAuthLogin("github")}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold border-0"
            >
              GitHub
            </Button>
            <Button
              size="lg"
              onPress={() => handleOAuthLogin("microsoft")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold border-0"
            >
              Microsoft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
