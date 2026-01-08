'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDocument, updateDocument } from '@/lib/hooks/useFirestore';
import { Order } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import { formatDateTime, logAudit } from '@/lib/utils/helpers';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = (params?.id as string) || null;
  const { data: order, loading } = useDocument<Order>('orders', id);
  
  const [processing, setProcessing] = useState(false);

  const handleUpdateStatus = async (newStatus: Order['status']) => {
    if (!id || !user) return;
    setProcessing(true);

    try {
      await updateDocument<Order>('orders', id, {
        status: newStatus,
        reviewedBy: user.uid,
        reviewedAt: Timestamp.now(),
      });

      await logAudit('order.reviewed', user.uid, {
        orderId: id,
        status: newStatus,
        email: order?.email,
      });
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="owner">
        <DashboardLayout>
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute requiredRole="owner">
        <DashboardLayout>
          <EmptyState
            title="Order Not Found"
            description="This order could not be found."
            icon={
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => router.back()}
                className="text-gray-300"
              >
                ← Back to Orders
              </Button>
            </div>

            {/* Order Details Card */}
            <Card className="p-6 mb-6">
              <div className="space-y-4">
                {/* Title and Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {order.name}
                    </h1>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        order.status === 'new' ? 'bg-amber-900/30 text-amber-200 border border-amber-600/50' :
                        order.status === 'reviewing' ? 'bg-blue-900/30 text-blue-200 border border-blue-600/50' :
                        order.status === 'converted' ? 'bg-green-900/30 text-green-200 border border-green-600/50' :
                        'bg-red-900/30 text-red-200 border border-red-600/50'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-sm bg-gray-800 text-gray-300 border border-gray-700">
                        {order.serviceType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-300">{order.description}</p>
                </div>

                {/* Project Details Grid */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-1">Budget</h3>
                    <p className="text-white">{order.budget}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-1">Timeline</h3>
                    <p className="text-white">{order.timeline}</p>
                  </div>
                </div>

                {/* Client Details */}
                <div className="pt-4 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Client Information</h3>
                  <div className="space-y-1">
                    <p className="text-gray-300">
                      <span className="text-gray-400">Name:</span> {order.name}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-400">Email:</span> {order.email}
                    </p>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="pt-4 border-t border-gray-700 text-sm text-gray-400">
                  <p>Submitted: {formatDateTime(order.createdAt)}</p>
                  {order.reviewedAt && (
                    <p>Reviewed: {formatDateTime(order.reviewedAt)}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Status Update Card */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Update Status</h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={order.status === 'new' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateStatus('new')}
                  isLoading={processing}
                  disabled={order.status === 'new'}
                >
                  New
                </Button>
                <Button
                  variant={order.status === 'reviewing' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateStatus('reviewing')}
                  isLoading={processing}
                  disabled={order.status === 'reviewing'}
                >
                  Reviewing
                </Button>
                <Button
                  variant={order.status === 'converted' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateStatus('converted')}
                  isLoading={processing}
                  disabled={order.status === 'converted'}
                >
                  Converted
                </Button>
                <Button
                  variant={order.status === 'rejected' ? 'danger' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateStatus('rejected')}
                  isLoading={processing}
                  disabled={order.status === 'rejected'}
                >
                  Rejected
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
