'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
// Navbar provided by root layout
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import OrderStepperForm from './OrderStepperForm';
import { createDocument } from '@/lib/hooks/useFirestore';
import { Order, ServiceType } from '@/lib/types';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function OrderPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serviceType: 'custom-software' as ServiceType,
    description: '',
    budget: '',
    timeline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/order');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitOrder = async (data: any) => {
    setLoading(true);
    setError('');

    try {
      const order: Omit<Order, 'id' | 'createdAt'> = {
        name: data.name,
        email: data.email,
        serviceType: data.serviceType,
        description: data.description,
        budget: data.budget,
        timeline: data.timeline,
        status: 'new',
      };

      await createDocument<Order>('orders', order);
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center allow-video">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full mx-4"
          >
            <Card className="text-center">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Request Submitted!
              </h2>
              <p className="text-gray-300 mb-6">
                Thank you for your interest in working with Saaforge. We'll review your request
                and get back to you within 24-48 hours.
              </p>
              <p className="text-sm text-gray-400">Redirecting to home...</p>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow allow-video">
        {/* Hero Section (Galaxy background behind title) */}
        <section className="py-20 relative overflow-hidden">
          {/* Galaxy removed */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Request a <span className="bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/70">Project</span>
              </h1>
              <p className="text-xl text-gray-300">
                Tell us about your project and we'll help bring it to life.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form Section */}
        <div className="relative">
          {/* Galaxy removed */}
          <div className="relative z-10">
        <section className="py-20 bg-transparent">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Project Request Form</h2>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                <OrderStepperForm onSubmit={submitOrder} loading={loading} />
              </Card>
            </motion.div>
          </div>
        </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
