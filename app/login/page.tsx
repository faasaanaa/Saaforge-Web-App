'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // Only redirect owners to their dashboard
      if (user.role === 'owner') {
        router.push('/dashboard/owner');
      } else {
        // Non-owners (team members, approved or not) go to homepage
        router.push('/');
      }
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(formData.email, formData.password);
      // Auth is now happening, useEffect will handle the result
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      // Auth is now happening, useEffect will handle the result
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">Saaforge</h1>
          </Link>
          <p className="text-gray-300">Sign in to your account</p>
        </div>

        <Card>
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="team@saaforge.com"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-gray-900 to-black text-gray-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
              isLoading={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-4">
              Don't have an account?{' '}
              <Link href="/register" className="text-gray-200 hover:text-white font-medium">
                Register with invite code
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              Or{' '}
              <Link href="/join" className="text-gray-300 hover:text-gray-200 underline">
                submit a join request
              </Link>
              {' '}to become a team member
            </p>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            By logging in, you agree to our{' '}
            <Link href="/terms" className="text-gray-300 hover:text-gray-200 underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-gray-300 hover:text-gray-200 underline">
              Privacy Policy
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-300">
              ← Back to home
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
