'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useCollection } from '@/lib/hooks/useFirestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import { TeamProfile, Project, Task } from '@/lib/types';
import { where } from 'firebase/firestore';

export default function TeamDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useCollection<TeamProfile>(
    'teamProfiles',
    user ? [where('userId', '==', user.uid)] : []
  );

  const { data: projects, loading: projectsLoading } = useCollection<Project>(
    'projects',
    user ? [where('assignedMembers', 'array-contains', user.uid)] : []
  );

  const { data: tasks } = useCollection<Task>(
    'tasks',
    user ? [where('assignedTo', '==', user.uid)] : []
  );

  const pendingTasks = tasks?.filter((t) => t.status !== 'completed') || [];
  const standalonePendingTasks = pendingTasks.filter((t) => !t.projectId);

  const currentProfile = profile?.[0];

  return (
    <ProtectedRoute requiredRole="team" requireTeamApproval>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >


            {/* Welcome Card */}
            <Card className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-4">
                Welcome{currentProfile?.name ? `, ${currentProfile.name}` : ''}!
              </h2>
              <p className="text-gray-300 mb-2 md:mb-4 text-sm md:text-base">
                This is your personal dashboard. Manage your profile, view assigned projects,
                and stay updated with team activities.
              </p>
              {!currentProfile?.name && (
                <p className="text-xs md:text-sm text-orange-400 bg-gray-800 border border-gray-700 rounded-lg p-2 md:p-3">
                  ⚠️ Please complete your profile to be visible on the team page.
                </p>
              )}
            </Card>

            {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 mb-6 md:mb-8">
              <Card>
                <div className="text-center">
                  <div className="text-2xl md:text-4xl mb-1 md:mb-2">⏳</div>
                  <p className="text-xl md:text-3xl font-bold text-white">
                    {pendingTasks.length}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400">Pending Tasks</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="text-2xl md:text-4xl mb-1 md:mb-2">
                    {currentProfile?.isPubliclyVisible ? '👁️' : '🔒'}
                  </div>
                  <p className="text-sm md:text-lg font-bold text-white">
                    {currentProfile?.isPubliclyVisible ? 'Public' : 'Private'}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400">Profile Visibility</p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="text-2xl md:text-4xl mb-1 md:mb-2">✓</div>
                  <p className="text-sm md:text-lg font-bold text-white">
                    {currentProfile?.isApproved ? 'Approved' : 'Pending'}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400">Account Status</p>
                </div>
              </Card>
            </div>

            {/* My Tasks */}
            <Card className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4">My Tasks</h2>
              {projectsLoading ? (
                <LoadingSpinner />
              ) : (projects && projects.length > 0) || standalonePendingTasks.length > 0 ? (
                <>
                  {projects && projects.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 mb-4">
                      {projects.map((project) => {
                        const projectTasks = tasks?.filter((t) => t.projectId === project.id && t.status !== 'completed') || [];
                        return (
                        <Card key={project.id} className="p-2 sm:p-4 flex flex-col h-full md:flex-col md:gap-3">
                      <div className="md:hidden flex flex-col gap-1 flex-1 w-full">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-[11px] font-semibold text-white line-clamp-2 flex-1">{project.name}</h3>
                          <span className="px-1 py-0.5 text-[7px] rounded-full bg-purple-600 text-purple-100 border border-purple-500 whitespace-nowrap">
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </div>
                        
                        <span className="px-1 py-0.5 text-[7px] rounded-full bg-blue-600 text-blue-100 border border-blue-500 inline-block">
                          {project.category || 'Project'}
                        </span>

                        {project.description && (
                          <p className="text-[8px] text-gray-300 line-clamp-2">{project.description}</p>
                        )}

                        {project.techStack && project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-0.5">
                            {project.techStack.slice(0, 2).map((tech) => (
                              <span key={tech} className="px-1 py-0.5 text-[7px] bg-gray-800 text-gray-300 rounded">
                                {tech}
                              </span>
                            ))}
                            {project.techStack.length > 2 && (
                              <span className="px-1 py-0.5 text-[7px] bg-gray-800 text-gray-300 rounded">
                                +{project.techStack.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {projectTasks.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {projectTasks.slice(0, 2).map((task) => (
                              <div key={task.id} className="flex items-center justify-between text-[7px] bg-gray-800/70 px-2 py-1 rounded border border-gray-700/50">
                                <span className="text-gray-200 line-clamp-1">{task.title}</span>
                                <span className="text-gray-400 capitalize">{task.status.replace('-', ' ')}</span>
                              </div>
                            ))}
                            {projectTasks.length > 2 && (
                              <span className="text-[7px] text-gray-400">+{projectTasks.length - 2} more tasks</span>
                            )}
                          </div>
                        )}

                        <Button size="sm" onClick={() => router.push(`/dashboard/team/tasks`)} className="mt-auto text-[8px] px-1 py-0.5 h-auto w-full">
                          Go to My Tasks
                        </Button>
                      </div>

                      <div className="hidden md:flex md:flex-col md:gap-3 md:flex-1 w-full">
                        <h3 className="text-sm font-semibold text-white line-clamp-2">{project.name}</h3>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-800 text-gray-300 border border-gray-700 inline-block">
                          {project.category || 'Project'}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-800 text-gray-300 border border-gray-700 inline-block">
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                        {projectTasks.length > 0 && (
                          <div className="space-y-1 text-[11px] text-gray-300">
                            {projectTasks.slice(0, 3).map((task) => (
                              <div key={task.id} className="flex items-center justify-between bg-gray-800/70 px-2 py-1 rounded border border-gray-700/50">
                                <span className="line-clamp-1">{task.title}</span>
                                <span className="text-gray-400 capitalize text-[10px]">{task.status.replace('-', ' ')}</span>
                              </div>
                            ))}
                            {projectTasks.length > 3 && (
                              <span className="text-[10px] text-gray-400">+{projectTasks.length - 3} more tasks</span>
                            )}
                          </div>
                        )}
                        <Button size="sm" onClick={() => router.push(`/dashboard/team/tasks`)} className="mt-auto text-xs px-2 py-1 h-auto w-full">
                          Go to My Tasks
                        </Button>
                      </div>
                    </Card>
                    );
                  })}
                </div>
                  )}
                  
                  {/* Standalone Tasks */}
                  {standalonePendingTasks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm md:text-base font-semibold text-gray-300 mb-2">
                        {projects && projects.length > 0 ? 'Other Tasks' : 'Your Tasks'}
                      </h3>
                      {standalonePendingTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-semibold line-clamp-1">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-300 capitalize ml-3">{task.status.replace('-', ' ')}</span>
                        </div>
                      ))}
                      {standalonePendingTasks.length > 5 && (
                        <p className="text-xs text-gray-400">+{standalonePendingTasks.length - 5} more tasks</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  title="No tasks assigned"
                  description="You'll see your assigned tasks here."
                  icon={
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
