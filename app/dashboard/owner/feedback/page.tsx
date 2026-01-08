'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCollection, updateDocument, deleteDocument } from '@/lib/hooks/useFirestore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { ProjectFeedback, Project } from '@/lib/types';
import { orderBy } from 'firebase/firestore';

export default function FeedbackPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const { markAsViewed } = useNotifications();

  useEffect(() => {
    markAsViewed('feedback');
  }, [markAsViewed]);
  
  const { data: allFeedback, loading: feedbackLoading } = useCollection<ProjectFeedback>(
    'projectFeedback',
    [orderBy('createdAt', 'desc')]
  );

  const { data: projects } = useCollection<Project>('projects', []);

  const getProjectName = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const filteredFeedback = allFeedback?.filter((feedback) => {
    let statusMatch = true;

    if (statusFilter === 'pending') statusMatch = !feedback.isApproved;
    if (statusFilter === 'approved') statusMatch = feedback.isApproved;

    return statusMatch;
  });

  const handleApprove = async (feedbackId: string) => {
    try {
      await updateDocument<ProjectFeedback>('projectFeedback', feedbackId, {
        isApproved: true,
      });
    } catch (error) {
      console.error('Failed to approve feedback:', error);
      alert('Failed to approve feedback');
    }
  };

  const handleDelete = async (feedback: ProjectFeedback) => {
    if (!confirm('Are you sure you want to delete this ' + (feedback.type === 'feedback' ? 'feedback' : 'improvement idea') + '?')) return;
    
    try {
      await deleteDocument('projectFeedback', feedback.id);
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      alert('Failed to delete feedback');
    }
  };

  const validateClientId = (feedback: ProjectFeedback): boolean => {
    if (feedback.projectType === 'company') return true;
    
    const project = projects?.find((p) => p.id === feedback.projectId);
    if (!project || !project.clientId) return false;
    
    return feedback.clientId === project.clientId;
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="inline-flex gap-1 items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <span 
            key={i} 
            className="text-xl text-white font-semibold opacity-100 hover:opacity-80 transform hover:scale-110 transition-all duration-200"
          >
            {i < rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
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
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>

                <p className="text-xs md:text-base text-gray-400 mt-1 md:mt-2">
                  Review and manage feedback and improvement ideas from users
                </p>
              </div>
            </div>

            {/* Filter Buttons - Status */}
            <div className="mb-4 md:mb-6 space-y-4">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-300 mb-2">Filter by Status</p>
                <div className="flex gap-1 md:gap-2 flex-wrap">
                  <Button
                    variant={statusFilter === 'all' ? 'primary' : 'outline'}
                    onClick={() => setStatusFilter('all')}
                    size="sm"
                    className="text-xs md:text-sm px-2 md:px-4"
                  >
                    All ({allFeedback?.length || 0})
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? 'primary' : 'outline'}
                    onClick={() => setStatusFilter('pending')}
                    size="sm"
                    className="text-xs md:text-sm px-2 md:px-4"
                  >
                    Pending ({allFeedback?.filter((f) => !f.isApproved).length || 0})
                  </Button>
                  <Button
                    variant={statusFilter === 'approved' ? 'primary' : 'outline'}
                    onClick={() => setStatusFilter('approved')}
                    size="sm"
                    className="text-xs md:text-sm px-2 md:px-4"
                  >
                    Approved ({allFeedback?.filter((f) => f.isApproved).length || 0})
                  </Button>
                </div>
              </div>
            </div>

            {feedbackLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredFeedback && filteredFeedback.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {filteredFeedback.map((feedback, index) => {
                  const isValidClientId = validateClientId(feedback);

                  return (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card className="p-2 sm:p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-[11px] font-bold text-white line-clamp-2">
                              {getProjectName(feedback.projectId)}
                            </h3>
                          </div>

                          <div className="flex items-center gap-0.5 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 text-[7px] font-semibold rounded-full ${
                                feedback.type === 'feedback'
                                  ? 'bg-blue-900/60 text-blue-200 border border-blue-600/60 shadow-sm'
                                  : 'bg-green-900/60 text-green-200 border border-green-600/60 shadow-sm'
                              }`}
                            >
                              {feedback.type === 'feedback' ? 'Feedback' : 'Idea'}
                            </span>
                            {feedback.isApproved ? (
                              <span className="px-1.5 py-0.5 text-[7px] font-semibold rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-600/60 shadow-sm">
                                ✓ Approved
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[7px] font-semibold rounded-full bg-amber-900/60 text-amber-200 border border-amber-600/60 shadow-sm">
                                Pending
                              </span>
                            )}
                            {feedback.projectType === 'client' && (
                              isValidClientId ? (
                                <span className="px-1.5 py-0.5 text-[7px] font-semibold rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-600/60 shadow-sm">
                                  Client ID OK
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 text-[7px] font-semibold rounded-full bg-red-900/60 text-red-200 border border-red-600/60 shadow-sm">
                                  Client ID ⚠️
                                </span>
                              )
                            )}
                          </div>

                          <p className="text-[8px] text-gray-300 line-clamp-2">{feedback.feedback}</p>

                          {feedback.rating && (
                            <div className="text-[7px] text-yellow-400">Rating: {renderStars(feedback.rating)}</div>
                          )}

                          <div className="text-[7px] text-gray-400 pt-1 border-t border-gray-700">
                            {feedback.userName || feedback.userEmail}
                          </div>

                          <div className="flex gap-1 mt-1 pt-1 border-t border-gray-700">
                            {!feedback.isApproved && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(feedback.id)}
                                className="text-[7px] px-1 py-0.5 flex-1 bg-emerald-600 hover:bg-emerald-700"
                              >
                                ✓ Approve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(feedback)}
                              className="text-[7px] px-1 py-0.5 flex-1 text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No feedback yet"
                description={
                  statusFilter === 'all'
                    ? 'No feedback has been submitted yet'
                    : statusFilter === 'pending'
                    ? 'No pending feedback to review'
                    : statusFilter === 'approved'
                    ? 'No approved feedback'
                    : 'No rejected feedback'
                }
                icon={
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
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
