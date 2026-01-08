'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCollection } from '@/lib/hooks/useFirestore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { ProjectFeedback, Project } from '@/lib/types';
import { orderBy } from 'firebase/firestore';

export default function TeamFeedbackPage() {
  const [showFeedback, setShowFeedback] = useState(true);
  const { markAsViewed } = useNotifications();

  useEffect(() => {
    markAsViewed('feedback');
  }, [markAsViewed]);
  
  // Get all projects
  const { data: projects } = useCollection<Project>('projects', []);

  // Get ALL feedback and ideas submitted
  const { data: allFeedback, loading: feedbackLoading } = useCollection<ProjectFeedback>(
    'projectFeedback',
    [orderBy('createdAt', 'desc')]
  );

  const getProjectName = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  // Apply toggle filter to show all feedback/ideas regardless of project
  const filteredFeedback = allFeedback?.filter((feedback) =>
    showFeedback ? feedback.type === 'feedback' : feedback.type === 'improvement'
  );

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
    <ProtectedRoute requiredRole="team" requireTeamApproval>
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
                  View all submitted feedback and improvement ideas from the community
                </p>
              </div>
            </div>

            {/* Toggle Feedback / Ideas */}
            <div className="flex justify-center mb-8 md:mb-12">
              <div className="bg-gray-900 rounded-lg p-1 inline-flex gap-1 border border-gray-800">
                <button
                  onClick={() => setShowFeedback(true)}
                  className={`px-3 md:px-6 py-2 rounded-md font-medium transition-all text-xs md:text-sm ${
                    showFeedback
                      ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  💬 Feedback
                </button>
                <button
                  onClick={() => setShowFeedback(false)}
                  className={`px-3 md:px-6 py-2 rounded-md font-medium transition-all text-xs md:text-sm ${
                    !showFeedback
                      ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  💡 Ideas
                </button>
              </div>
            </div>

            {feedbackLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredFeedback && filteredFeedback.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {filteredFeedback.map((feedback, index) => {
                  return (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card className="border border-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg hover:shadow-2xl hover:border-purple-500/40 transition-all duration-300 p-2 sm:p-4">
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
                          </div>

                          <p className="text-[8px] text-gray-300 line-clamp-2">{feedback.feedback}</p>

                          {feedback.rating && (
                            <div className="text-[7px] text-yellow-400">
                              Rating: {renderStars(feedback.rating)}
                            </div>
                          )}

                          <div className="text-[7px] text-gray-400 pt-1 border-t border-gray-700">
                            {feedback.userName || feedback.userEmail}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon="💭"
                title="No Feedback Yet"
                description={
                  showFeedback
                    ? "No feedback has been submitted yet."
                    : "No improvement ideas have been submitted yet."
                }
              />
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
