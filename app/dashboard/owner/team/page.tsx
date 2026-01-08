'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useCollection } from '@/lib/hooks/useFirestore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { TeamProfile } from '@/lib/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function TeamManagementPage() {
  const router = useRouter();
  const { data: allTeamMembers, loading } = useCollection<TeamProfile>('teamProfiles');
  const { markAsViewed } = useNotifications();

  useEffect(() => {
    markAsViewed('team');
  }, [markAsViewed]);

  // Filter out profiles that are incomplete (just logged in but haven't filled the form)
  // Also filter out old email-based duplicates (keep only UID-based profiles)
  const teamMembers = allTeamMembers?.filter((member) => {
    // Filter out email-based IDs (old duplicates from before UID-based fix)
    if (member.id.includes('@')) {
      return false;
    }
    
    // Show if any of these conditions are true:
    // 1. Profile is approved (owner approved them)
    // 2. Name is filled AND (has bio OR has skills OR has interests)
    // 3. Has role filled (from join request)
    return (
      member.isApproved ||
      (member.name && member.name.trim() !== '' && 
        (member.bio || (member.skills && member.skills.length > 0) || (member.interests && member.interests.length > 0))
      ) ||
      (member.role && member.role.trim() !== '')
    );
  });

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
              <div>

                <p className="text-gray-400 mt-2">
                  <span className="font-semibold text-blue-400">{teamMembers?.length || 0}</span> team members
                </p>
              </div>
            </div>

            {!teamMembers || teamMembers.length === 0 ? (
              <EmptyState
                title="No Team Members"
                description="No team members have been added yet."
              />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {teamMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-2 sm:p-4 flex flex-col h-full">
                      {/* Mobile view */}
                      <div
                        className="md:hidden cursor-pointer flex flex-col gap-1 flex-1"
                        onClick={() => router.push(`/dashboard/owner/team-member?id=${member.id}`)}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-[11px] font-semibold text-white line-clamp-2 flex-1">
                            {member.name || 'No Name'}
                          </p>
                          {member.isApproved ? (
                            <span className="px-1 py-0.5 text-[7px] rounded-full bg-green-600 text-green-100 border border-green-500 whitespace-nowrap">
                              Approved
                            </span>
                          ) : (
                            <span className="px-1 py-0.5 text-[7px] rounded-full bg-yellow-600 text-yellow-100 border border-yellow-500 whitespace-nowrap">
                              Pending
                            </span>
                          )}
                        </div>
                        
                        <span className="px-1 py-0.5 text-[7px] rounded-full bg-indigo-600 text-indigo-100 border border-indigo-500 inline-block">
                          {member.role || 'Member'}
                        </span>

                        {member.bio && (
                          <p className="text-[8px] text-gray-300 line-clamp-2">{member.bio}</p>
                        )}

                        {member.skills && member.skills.length > 0 && (
                          <div className="flex flex-wrap gap-0.5">
                            {member.skills.slice(0, 2).map((skill) => (
                              <span key={skill} className="px-1 py-0.5 text-[7px] bg-gray-800 text-gray-300 rounded">
                                {skill}
                              </span>
                            ))}
                            {member.skills.length > 2 && (
                              <span className="px-1 py-0.5 text-[7px] bg-gray-800 text-gray-300 rounded">
                                +{member.skills.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Desktop detailed view */}
                      <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-2">
                        <div 
                          className="flex-grow min-w-0 cursor-pointer"
                          onClick={() => router.push(`/dashboard/owner/team-member?id=${member.id}`)}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {member.profilePicture ? (
                              <img 
                                src={member.profilePicture} 
                                alt={member.name}
                                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {member.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <h3 className="text-sm font-bold text-white truncate">
                              {member.name || 'No Name'}
                            </h3>
                            <div className="flex gap-1.5">
                              {member.isApproved ? (
                                <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px] font-medium whitespace-nowrap">
                                  Approved
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px] font-medium whitespace-nowrap">
                                  Pending
                                </span>
                              )}
                              {member.isPubliclyVisible ? (
                                <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px] font-medium whitespace-nowrap">
                                  Public
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px] font-medium whitespace-nowrap">
                                  Private
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-400 text-[10px] mb-1.5 truncate">{member.email}</p>
                          
                          {member.role && (
                            <p className="text-[10px] text-gray-400 mb-1.5 truncate">
                              <strong>Role:</strong> {member.role}
                            </p>
                          )}

                          {member.skills && member.skills.length > 0 && (
                            <div className="mb-1.5">
                              <p className="text-[10px] font-semibold text-gray-300 mb-0.5">Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {member.skills.slice(0, 4).map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {member.skills.length > 4 && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]">
                                    +{member.skills.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {member.interests && member.interests.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-300 mb-0.5">Interests:</p>
                              <div className="flex flex-wrap gap-1">
                                {member.interests.slice(0, 3).map((interest, index) => (
                                  <span
                                    key={index}
                                    className="px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]"
                                  >
                                    {interest}
                                  </span>
                                ))}
                                {member.interests.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]">
                                    +{member.interests.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
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
