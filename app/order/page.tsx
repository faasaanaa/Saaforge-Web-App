'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const order: Omit<Order, 'id' | 'createdAt'> = {
        name: formData.name,
        email: formData.email,
        serviceType: formData.serviceType,
        description: formData.description,
        budget: formData.budget,
        timeline: formData.timeline,
        status: 'new',
      };

      await createDocument<Order>('orders', order);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
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
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-black via-gray-900 to-black py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Request a <span className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 bg-clip-text text-transparent">Project</span>
              </h1>
              <p className="text-xl text-gray-300">
                Tell us about your project and we'll help bring it to life.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />

                  <div>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-white mb-1">
                      Type of Service
                    </label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="automation">Automation</option>
                      <option value="website">Website Development</option>
                      <option value="custom-software">Custom Software</option>
                      <option value="consulting">Consulting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <Textarea
                    label="Project Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Describe your project in detail. What problem are you trying to solve? What features do you need?"
                    helperText="Be as specific as possible to help us understand your needs"
                  />

                  <Input
                    label="Budget Range"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    placeholder="e.g., $5,000 - $10,000"
                    helperText="Give us an idea of your budget for this project"
                  />

                  <Input
                    label="Timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 2-3 months"
                    helperText="When do you need this project completed?"
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={loading}
                  >
                    Submit Request
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
