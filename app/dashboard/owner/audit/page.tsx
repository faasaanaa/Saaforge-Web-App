'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useCollection } from '@/lib/hooks/useFirestore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { AuditLog } from '@/lib/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/Loading';
import { orderBy, Timestamp } from 'firebase/firestore';

export default function AuditLogsPage() {
  const { data: logs, loading } = useCollection<AuditLog>('auditLogs', [
    orderBy('timestamp', 'desc'),
  ]);
  const { markAsViewed } = useNotifications();

  useEffect(() => {
    markAsViewed('audit');
  }, [markAsViewed]);

  const formatTimestamp = (timestamp: Timestamp | Date | null | undefined) => {
    if (!timestamp) return 'N/A';
    const date = (timestamp as Timestamp)?.toDate ? (timestamp as Timestamp).toDate() : new Date(timestamp as Date);
    return date.toLocaleString();
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'bg-gray-800 text-gray-300';
    if (action.includes('deleted')) return 'bg-gray-800 text-gray-300';
    if (action.includes('updated')) return 'bg-gray-800 text-gray-300';
    if (action.includes('approved')) return 'bg-gray-800 text-gray-300';
    if (action.includes('rejected')) return 'bg-gray-800 text-gray-300';
    return 'bg-gray-800 text-gray-300';
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="owner">
        <DashboardLayout>
          <LoadingSpinner />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">

              <div className="text-sm text-gray-400">
                Total Logs: {logs?.length || 0}
              </div>
            </div>

            {!logs || logs.length === 0 ? (
              <EmptyState
                title="No Audit Logs"
                description="No activity has been logged yet."
              />
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                              {log.action.toUpperCase()}
                            </span>
                            {log.targetType && (
                              <span className="text-sm font-semibold text-gray-300">
                                {log.targetType}
                              </span>
                            )}
                          </div>

                          {log.details && typeof log.details === 'object' && (
                            <p className="text-gray-300 mb-2">
                              {JSON.stringify(log.details, null, 2)}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <div>
                              <strong>User:</strong> {log.performedBy}
                            </div>
                            {log.targetId && (
                              <div>
                                <strong>Target:</strong> {log.targetId}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right text-sm text-gray-400 whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
