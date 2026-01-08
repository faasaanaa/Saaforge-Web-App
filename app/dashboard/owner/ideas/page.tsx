'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCollection, updateDocument } from '@/lib/hooks/useFirestore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { ProjectIdea } from '@/lib/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Timestamp } from 'firebase/firestore';

export default function IdeasRequestsPage() {
  const { data: allIdeas, loading } = useCollection<ProjectIdea>('projectIdeas');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const { markAsViewed } = useNotifications();

  useEffect(() => {
    markAsViewed('ideas');
  }, [markAsViewed]);

  const pendingIdeas = allIdeas?.filter((idea) => idea.status === 'pending') || [];

  const handleApproveIdea = async (ideaId: string) => {
    setProcessingId(ideaId);
    try {
      await updateDocument<ProjectIdea>('projectIdeas', ideaId, {
        status: 'approved',
        reviewedAt: Timestamp.now(),
      });
      alert('Idea approved successfully!');
    } catch (error) {
      console.error('Error approving idea:', error);
      alert('Failed to approve idea');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectIdea = async (ideaId: string) => {
    setProcessingId(ideaId);
    try {
      const payload: Partial<ProjectIdea> = {
        status: 'rejected',
        reviewedAt: Timestamp.now(),
      };
      // Include review notes only if present; rejection does not require notes
      if (reviewNotes.trim()) {
        payload.reviewNotes = reviewNotes.trim();
      }

      await updateDocument<ProjectIdea>('projectIdeas', ideaId, payload);
      setReviewingId(null);
      setReviewNotes('');
      alert('Idea rejected successfully!');
    } catch (error) {
      console.error('Error rejecting idea:', error);
      alert('Failed to reject idea');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddReview = async (ideaId: string) => {
    if (!reviewNotes.trim()) {
      alert('Please provide your review notes');
      return;
    }

    setProcessingId(ideaId);
    try {
      await updateDocument<ProjectIdea>('projectIdeas', ideaId, {
        reviewNotes,
      });
      setReviewingId(null);
      setReviewNotes('');
      alert('Review added successfully!');
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to add review');
    } finally {
      setProcessingId(null);
    }
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
            <div className="mb-8">

              <p className="text-gray-400 mt-2">
                Review and manage project ideas submitted by team members.
              </p>
              {pendingIdeas.length > 0 && (
                <p className="text-lg text-orange-400 font-semibold mt-3">
                  {pendingIdeas.length} pending idea{pendingIdeas.length !== 1 ? 's' : ''} awaiting review
                </p>
              )}
            </div>

            {!allIdeas || allIdeas.length === 0 ? (
              <EmptyState
                title="No Project Ideas"
                description="Team members haven't submitted any project ideas yet."
              />
            ) : (
              <div className="space-y-4">
                {allIdeas.map((idea) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg hover:shadow-2xl hover:border-purple-500/40 transition-all duration-300">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-white">{idea.title}</h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                idea.status === 'pending'
                                  ? 'bg-yellow-900/60 text-yellow-200 border border-yellow-600/60 shadow-sm'
                                  : idea.status === 'approved'
                                  ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-600/60 shadow-sm'
                                  : idea.status === 'in-progress'
                                  ? 'bg-blue-900/60 text-blue-200 border border-blue-600/60 shadow-sm'
                                  : 'bg-red-900/60 text-red-200 border border-red-600/60 shadow-sm'
                              }`}
                            >
                              {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                            </span>
                          </div>

                          <p className="text-gray-300 mb-3">
                            <strong className="text-gray-100">Submitted by:</strong> <span className="text-purple-300">{idea.submitterName}</span>
                          </p>

                          <p className="text-gray-100 mb-4 leading-relaxed">{idea.description}</p>

                          {idea.proposedTechStack && idea.proposedTechStack.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Tech Stack:</p>
                              <div className="flex flex-wrap gap-2">
                                {idea.proposedTechStack.map((tech) => (
                                  <span
                                    key={tech}
                                    className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-900/40 to-blue-900/40 text-purple-200 border border-purple-600/30 text-xs font-medium shadow-sm"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {idea.estimatedDuration && (
                            <p className="text-sm text-gray-300 mb-4 font-medium">
                              <strong>⏱️ Estimated Duration:</strong> {idea.estimatedDuration}
                            </p>
                          )}

                          {reviewingId === idea.id ? (
                            <div className="mt-4 p-4 bg-gradient-to-br from-gray-900/60 to-gray-800/60 border border-gray-700/50 rounded-lg space-y-3">
                              <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add your review notes, feedback, or rejection reason..."
                                className="w-full px-4 py-2 border border-gray-700 bg-gray-950 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddReview(idea.id)}
                                  isLoading={processingId === idea.id}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Save Review
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReviewingId(null);
                                    setReviewNotes('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            idea.reviewNotes && (
                              <div className="mt-4 p-4 bg-gradient-to-br from-gray-900/40 to-gray-800/40 border border-gray-700/50 rounded-lg">
                                <p className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">📝 Your Review:</p>
                                <p className="text-sm text-gray-200 leading-relaxed">{idea.reviewNotes}</p>
                              </div>
                            )
                          )}
                        </div>

                        {idea.status === 'pending' && (
                          <div className="flex flex-col gap-2 md:min-w-[140px]">
                            <Button
                              size="sm"
                              onClick={() => handleApproveIdea(idea.id)}
                              isLoading={processingId === idea.id}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              ✓ Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleRejectIdea(idea.id)}
                              isLoading={processingId === idea.id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              ✗ Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReviewingId(idea.id)}
                              isLoading={processingId === idea.id}
                            >
                              Add Review
                            </Button>
                          </div>
                        )}
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
