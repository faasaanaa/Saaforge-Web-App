'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useCollection } from '@/lib/hooks/useFirestore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Order } from '@/lib/types';

export default function OwnerOrdersPage() {
  const router = useRouter();
  const { data: orders, loading } = useCollection<Order>('orders');
  const { markAsViewed } = useNotifications();

  useEffect(() => {
    markAsViewed('orders');
  }, [markAsViewed]);

  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >


            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card 
                      className="p-2 sm:p-4 md:p-5 cursor-pointer hover:border-blue-500/50 transition-all"
                      onClick={() => router.push(`/dashboard/owner/orders/${order.id}`)}
                    >
                      {/* Mobile view */}
                      <div className="md:hidden flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-[11px] font-bold text-white line-clamp-2 flex-1">
                            {order.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-0.5 flex-wrap">
                          <span className="px-1.5 py-0.5 text-[7px] rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                            {order.serviceType.length > 8 ? order.serviceType.substring(0, 8) + '...' : order.serviceType}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-medium ${
                            order.status === 'new' ? 'bg-amber-900/50 text-amber-300' :
                            order.status === 'reviewing' ? 'bg-blue-900/50 text-blue-300' :
                            order.status === 'converted' ? 'bg-emerald-900/50 text-emerald-300' :
                            'bg-red-900/50 text-red-300'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-[8px] text-gray-300 line-clamp-2">{order.description}</p>

                        <div className="grid grid-cols-2 gap-1 text-[7px] text-gray-400">
                          <div>Budget: {order.budget}</div>
                          <div>Timeline: {order.timeline}</div>
                        </div>

                        <div className="text-[7px] text-gray-400 pt-1 border-t border-gray-700">
                          {order.email}
                        </div>
                      </div>

                      {/* Desktop view */}
                      <div className="hidden md:block">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-base font-bold text-white line-clamp-2 flex-1">
                            {order.name}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            order.status === 'new' ? 'bg-amber-900/30 text-amber-200 border border-amber-600/50' :
                            order.status === 'reviewing' ? 'bg-blue-900/30 text-blue-200 border border-blue-600/50' :
                            order.status === 'converted' ? 'bg-green-900/30 text-green-200 border border-green-600/50' :
                            'bg-red-900/30 text-red-200 border border-red-600/50'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">{order.description}</p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-xs border border-gray-700">
                              {order.serviceType}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-gray-400">
                            <div><span className="font-medium">Budget:</span> {order.budget}</div>
                            <div><span className="font-medium">Timeline:</span> {order.timeline}</div>
                          </div>
                          <div className="pt-2 border-t border-gray-700 text-xs text-gray-400 truncate">
                            {order.email}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No orders yet"
                description="Client project requests will appear here."
                icon={
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                }
              />
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
