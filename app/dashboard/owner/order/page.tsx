'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useDocument } from '@/lib/hooks/useFirestore';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Order } from '@/lib/types';

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get('id');

  const { data: order, loading, error } = useDocument<Order>(
    'orders',
    orderId
  );

  if (!orderId) {
    return (
      <EmptyState
        title="No order selected"
        description="Select an order from the orders list"
        icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
      />
    );
  }

  if (loading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  if (error || !order) {
    return (
      <EmptyState
        title="Order not found"
        description="The order you're looking for doesn't exist"
        icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2" /></svg>}
      />
    );
  }

  const statusColor = {
    new: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
    reviewing: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
    converted: 'bg-green-900/50 text-green-300 border-green-700/50',
    rejected: 'bg-red-900/50 text-red-300 border-red-700/50',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
      >
        ← Back to Orders
      </button>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">{order.name}</h1>
          <span className={`px-3 py-1 text-sm rounded-full border ${statusColor[order.status as keyof typeof statusColor]}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <p className="text-gray-300 mb-6">{order.description}</p>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Service Type</p>
            <p className="text-white font-semibold">{order.serviceType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Budget</p>
            <p className="text-white font-semibold">${order.budget}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Timeline</p>
            <p className="text-white font-semibold">{order.timeline}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Contact Email</p>
            <p className="text-white font-semibold">{order.email}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <OrderDetailContent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
