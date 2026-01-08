'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useCollection } from '@/lib/hooks/useFirestore';
import { createDocument, updateDocument, deleteDocument } from '@/lib/hooks/useFirestore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { JoinRequest, TeamProfile } from '@/lib/types';
import { where, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import { logAudit } from '@/lib/utils/helpers';

export default function JoinRequestsPage() {
  const { user } = useAuth();
  const { data: requests, loading } = useCollection<JoinRequest>('joinRequests', [
    where('status', '==', 'pending'),
  ]);
  const [processing, setProcessing] = useState<string | null>(null);
  const { markAsViewed } = useNotifications();

  useEffect(() => {
    markAsViewed('requests');
  }, [markAsViewed]);

  const handleApprove = async (request: JoinRequest) => {
    if (!user) return;
    setProcessing(request.id);

    try {
      // Create team profile for the approved member
      const profileData: any = {
        userId: request.userId, // Use actual UID from join request
        name: request.name,
        email: request.email,
        role: 'Team Member', // Default role
        bio: request.reason, // Use their join reason as initial bio
        profilePicture: '', // Will be updated when they log in with Google Auth
        skills: request.skills || [],
        interests: request.interests || [],
        achievements: request.achievements || [],
        portfolioLinks: request.portfolioLinks || [],
        socialLinks: {
          github: request.portfolioLinks?.find(l => l?.includes('github')) || '',
          linkedin: request.portfolioLinks?.find(l => l?.includes('linkedin')) || '',
          twitter: '',
          website: '',
        },
        visibility: {
          name: true,
          role: true,
          bio: true,
          skills: true,
          interests: true,
          achievements: true,
          portfolioLinks: true,
          socialLinks: true,
        },
        isPubliclyVisible: true,
        isApproved: true,
      };

      // Create teamProfile using UID to prevent duplicates
      const createdProfile = await createDocument<TeamProfile>('teamProfiles', profileData, request.userId);

      // Update request status
      await updateDocument<JoinRequest>('joinRequests', request.id, {
        status: 'approved',
        reviewedBy: user.uid,
        reviewedAt: Timestamp.now(),
      });

      // Delete the request after approval
      await deleteDocument('joinRequests', request.id);
      
      // Note: User role will be updated to 'team' when they next login
      // and AuthContext checks if approved teamProfile exists

      await logAudit('team.approved', user.uid, {
        requestId: request.id,
        email: request.email,
        name: request.name,
      });

      alert(`${request.name} has been added to the team!`);
    } catch (error) {
      alert('Failed to approve request. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: JoinRequest) => {
    if (!user) return;
    if (!confirm('Are you sure you want to reject this request?')) return;

    setProcessing(request.id);

    try {
      await updateDocument<JoinRequest>('joinRequests', request.id, {
        status: 'rejected',
        reviewedBy: user.uid,
        reviewedAt: Timestamp.now(),
      });

      await logAudit('team.rejected', user.uid, {
        requestId: request.id,
        email: request.email,
        name: request.name,
      });
    } catch (error) {
      alert('Failed to reject request. Please try again.');
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
            <div className="mb-8">

            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : requests && requests.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {requests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="p-2 sm:p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-[11px] font-bold text-white line-clamp-2">
                            {request.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-0.5 flex-wrap">
                          {request.skills.length > 0 && (
                            <span className="px-1.5 py-0.5 text-[7px] rounded-full bg-blue-900/50 text-blue-300 border border-blue-700">
                              {request.skills[0].length > 6 ? request.skills[0].substring(0, 6) + '...' : request.skills[0]}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 text-[7px] rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-700">
                            Pending
                          </span>
                        </div>

                        <p className="text-[8px] text-gray-300 line-clamp-2">{request.reason}</p>

                        {request.skills.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 text-[7px]">
                            {request.skills.slice(0, 2).map((skill) => (
                              <span key={skill} className="px-1 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                                {skill}
                              </span>
                            ))}
                            {request.skills.length > 2 && (
                              <span className="text-[7px] text-gray-400">+{request.skills.length - 2}</span>
                            )}
                          </div>
                        )}

                        <div className="text-[7px] text-gray-400 pt-1 border-t border-gray-700">
                          {request.email}
                        </div>

                        <div className="flex gap-1 mt-1 pt-1 border-t border-gray-700">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(request)}
                            isLoading={processing === request.id}
                            className="text-[7px] px-1 py-0.5 flex-1"
                          >
                            ✓ Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(request)}
                            isLoading={processing === request.id}
                            className="text-[7px] px-1 py-0.5 flex-1"
                          >
                            ✗ Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No pending requests"
                description="New join requests will appear here for your review."
                icon={
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
