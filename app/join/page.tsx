'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Navbar provided by root layout
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import StepperForm from './StepperForm';
import { createDocument } from '@/lib/hooks/useFirestore';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function JoinPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/join');
    }
  }, [authLoading, user, router]);

  // Redirect to home after showing success
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => router.push('/'), 3500);
      return () => clearTimeout(t);
    }
    return;
  }, [success, router]);

  // Show loader while auth is resolving
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  // Prevent render during redirect
  if (!user) return null;

  // Handle form submit
  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      // Save application to Firestore under `joinRequests` so owners see it
      const payload = {
        ...data,
        userId: user?.uid || null,
        userEmail: user?.email || null,
        status: 'pending',
      };

      await createDocument('joinRequests', payload);

      setSuccess(true);
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col relative">
        <main className="flex-grow flex items-center justify-center py-16 relative z-10 allow-video">
          {/* Galaxy removed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full mx-6"
          >
            <Card className="text-center p-8 shadow-2xl border border-gray-800">
              <div className="text-6xl mb-4 text-green-400">✓</div>
              <h2 className="text-2xl font-bold text-white mb-2">Application Submitted</h2>
              <p className="text-sm text-gray-300 mb-4">Thanks — we've received your application. We'll get back to you within 24 hours.</p>
              <p className="text-xs text-gray-500">Redirecting to home...</p>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Default form screen
  return (
    <div className="min-h-screen flex flex-col relative">
      <main className="flex-grow relative z-10 allow-video">
        {/* Galaxy removed */}
        {/* Hero heading (transparent, Galaxy behind) */}
        <section className="py-20 relative overflow-hidden bg-transparent">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Join Saaforge</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">Apply to join the Saaforge team — tell us about yourself and what you'd like to build together.</p>
          </div>
        </section>

        {/* Centered form section */}
        <section className="flex items-center justify-center py-12 bg-transparent">
          <div className="relative w-full max-w-lg px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full mx-auto"
            >
              <Card className="p-8 shadow-2xl border border-gray-800">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">Application Form</h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-950/60 border border-red-700 rounded-lg text-red-200">{error}</div>
                )}

                <div className="space-y-6">
                  <StepperForm onSubmit={handleSubmit} loading={loading} />
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
