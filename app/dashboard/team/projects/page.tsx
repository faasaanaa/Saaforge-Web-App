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
import { useCollection, createDocument } from '@/lib/hooks/useFirestore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Project } from '@/lib/types';
import { where, Timestamp } from 'firebase/firestore';
import { logAudit } from '@/lib/utils/helpers';
import { useRouter } from 'next/navigation';

interface ProjectApplication {
  id?: string;
  projectId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export default function BrowseProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter] = useState<'all' | 'company'>('all');
  const [applicationModal, setApplicationModal] = useState<Project | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { markAsViewed } = useNotifications();

  useEffect(() => {
    markAsViewed('projects');
  }, [markAsViewed]);

  // Load all published projects (only company projects for team members)
  const { data: allProjects, loading } = useCollection<Project>('projects', [
    where('isPublished', '==', true),
    where('projectType', '==', 'company'),
  ]);

  const projects = filter === 'company' 
    ? allProjects?.filter(p => p.projectType === 'company')
    : allProjects;

  const handleApply = async (project: Project) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const application: Omit<ProjectApplication, 'id'> = {
        projectId: project.id,
        userId: user.uid,
        userName: user.email?.split('@')[0] || 'Team Member',
        userEmail: user.email || '',
        message,
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      await createDocument('projectApplications', application);

      await logAudit('project.created', user.uid, {
        projectId: project.id,
        projectName: project.name,
      });

      alert(`Application submitted for ${project.name}! The owner will review it soon.`);
      setApplicationModal(null);
      setMessage('');
    } catch (error) {
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
            <div className="mb-8">

              <p className="text-gray-300">
                Explore company projects and apply to participate
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card hover className="h-full flex flex-col p-2 sm:p-4">
                      {/* Mobile view */}
                      <div className="md:hidden flex flex-col gap-1 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-[11px] font-semibold text-white line-clamp-2 flex-1">{project.name}</p>
                          <span className="px-1 py-0.5 text-[7px] rounded-full bg-green-600 text-green-100 border border-green-500 whitespace-nowrap">
                            {project.projectType === 'client' ? 'Client' : 'Company'}
                          </span>
                        </div>

                        {project.description && (
                          <p className="text-[8px] text-gray-300 line-clamp-2">{project.description}</p>
                        )}

                        {project.techStack && project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-0.5">
                            {project.techStack.slice(0, 3).map((tech) => (
                              <span key={tech} className="px-1 py-0.5 text-[7px] bg-gray-800 text-gray-300 rounded">
                                {tech}
                              </span>
                            ))}
                            {project.techStack.length > 3 && (
                              <span className="px-1 py-0.5 text-[7px] bg-gray-800 text-gray-300 rounded">
                                +{project.techStack.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <Button size="sm" onClick={() => router.push(`/dashboard/team/project?id=${project.id}`)} className="mt-auto text-[8px] px-1 py-0.5 h-auto w-full">
                          View
                        </Button>
                      </div>

                      {/* Desktop detailed view */}
                      <div className="hidden md:flex md:flex-col md:flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">
                            {project.name}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs rounded-full ${
                              project.status === 'completed'
                                ? 'bg-gray-800 text-gray-300'
                                : project.status === 'active'
                                ? 'bg-gray-800 text-gray-300'
                                : 'bg-gray-800 text-gray-300'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>

                        <p className="text-gray-300 mb-4">{project.description}</p>

                        {project.techStack.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-white mb-2">
                              Tech Stack
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {project.techStack.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setApplicationModal(project)}
                            className="w-full"
                          >
                            🙋 Apply to Join
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No projects available"
                description="Check back later for company projects you can join"
                icon={
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
              />
            )}
          </motion.div>
        </div>

        {/* Application Modal */}
        {applicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Apply to {applicationModal.name}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Why do you want to join this project? *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your interest and relevant experience..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950 placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={() => handleApply(applicationModal)}
                  isLoading={submitting}
                  disabled={!message.trim()}
                  className="flex-1"
                >
                  Submit Application
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setApplicationModal(null);
                    setMessage('');
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
