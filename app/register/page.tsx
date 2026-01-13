'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithInviteCode } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await registerWithInviteCode(formData.email, formData.password, formData.inviteCode);
      // If the invite allows any email or was linked to a join request, treat as auto-approved
      if (result?.invite?.ignoreEmail || result?.invite?.requestId) {
        router.push('/dashboard/team');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please check your invite code.');
    } finally {
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
          <p className="text-gray-300">Create your team account</p>
        </div>

        <Card>
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Invite Code"
              name="inviteCode"
              value={formData.inviteCode}
              onChange={handleChange}
              required
              placeholder="XXXXXXXXXXXX"
              helperText="Enter the invite code provided by the team owner"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              helperText="Use the email associated with your invite code"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              helperText="At least 6 characters"
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
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
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-gray-200 hover:text-white font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
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
