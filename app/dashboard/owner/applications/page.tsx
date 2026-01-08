'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCollection, updateDocument } from '@/lib/hooks/useFirestore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Project } from '@/lib/types';
import { Timestamp, orderBy as firestoreOrderBy } from 'firebase/firestore';

interface ProjectApplication {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [processing, setProcessing] = useState<string | null>(null);
  const { markAsViewed } = useNotifications();

  useEffect(() => {
    markAsViewed('applications');
  }, [markAsViewed]);

  const { data: applications, loading } = useCollection<ProjectApplication>(
    'projectApplications',
    [firestoreOrderBy('createdAt', 'desc')]
  );
  const { data: projects } = useCollection<Project>('projects');

  const getProjectName = (projectId: string) => {
    return projects?.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const handleApprove = async (application: ProjectApplication) => {
    if (!user || !confirm('Approve this application?')) return;
    setProcessing(application.id);

    try {
      await updateDocument('projectApplications', application.id, {
        status: 'approved',
      });
      alert('Application approved! Now assign the user to the project.');
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve application.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (application: ProjectApplication) => {
    if (!user || !confirm('Reject this application?')) return;
    setProcessing(application.id);

    try {
      await updateDocument('projectApplications', application.id, {
        status: 'rejected',
      });
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject application.');
    } finally {
      setProcessing(null);
    }
  };

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
            ) : applications && applications.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {applications.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="p-2 sm:p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-[11px] font-bold text-white line-clamp-2">
                            {app.userName}
                          </h3>
                        </div>

                        <div className="flex items-center gap-0.5 flex-wrap">
                          <span className="px-1.5 py-0.5 text-[7px] rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                            {getProjectName(app.projectId).length > 8 ? getProjectName(app.projectId).substring(0, 8) + '...' : getProjectName(app.projectId)}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-medium ${
                            app.status === 'approved' ? 'bg-emerald-900/50 text-emerald-300' :
                            app.status === 'rejected' ? 'bg-red-900/50 text-red-300' :
                            'bg-amber-900/50 text-amber-300'
                          }`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-[8px] text-gray-300 line-clamp-2">{app.message}</p>

                        <div className="text-[7px] text-gray-400 pt-1 border-t border-gray-700">
                          {app.userEmail}
                        </div>

                        {app.status === 'pending' && (
                          <div className="flex gap-1 mt-1 pt-1 border-t border-gray-700">
                            <Button size="sm" onClick={() => handleApprove(app)} isLoading={processing === app.id} className="text-[7px] px-1 py-0.5 flex-1">
                              ✓ Approve
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleReject(app)} isLoading={processing === app.id} className="text-[7px] px-1 py-0.5 flex-1">
                              ✗ Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No applications yet"
                description="Team member project applications will appear here"
                icon={
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
