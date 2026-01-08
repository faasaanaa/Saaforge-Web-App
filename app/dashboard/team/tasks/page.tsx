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
import { Project, Task } from '@/lib/types';
import { where, Timestamp } from 'firebase/firestore';
import { formatDateTime } from '@/lib/utils/helpers';

export default function MyTasksPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const { markAsViewed } = useNotifications();

  useEffect(() => {
    markAsViewed('tasks');
  }, [markAsViewed]);

  // Load tasks assigned to current user
  const { data: allTasks, loading } = useCollection<Task>('tasks', [
    where('assignedTo', '==', user?.uid || ''),
  ]);

  // Load projects user is part of
  const { data: assignedProjects } = useCollection<Project>('projects', [
    where('assignedMembers', 'array-contains', user?.uid || ''),
  ]);

  const tasks = filter === 'all' 
    ? allTasks
    : allTasks?.filter(t => t.status === filter);

  const handleUpdateStatus = async (task: Task, newStatus: Task['status']) => {
    if (!user) return;

    try {
      const updates: Partial<Task> = {
        status: newStatus,
        updatedAt: Timestamp.now(),
      };

      // If marking as completed, add completedAt timestamp
      if (newStatus === 'completed') {
        updates.completedAt = Timestamp.now();
      }

      await updateDocument<Task>('tasks', task.id!, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-gray-800 text-gray-300';
      case 'medium':
        return 'bg-gray-800 text-gray-300';
      case 'low':
        return 'bg-gray-800 text-gray-300';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-800 text-gray-300';
      case 'in-progress':
        return 'bg-gray-800 text-gray-300';
      case 'todo':
        return 'bg-gray-800 text-gray-300';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-700';
    if (grade >= 70) return 'bg-blue-100 text-blue-700';
    if (grade >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <ProtectedRoute requiredRole="team">
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">

              <p className="text-gray-300">
                Tasks assigned to you by the project owner
              </p>
            </div>

            {/* Projects Overview */}
            {assignedProjects && assignedProjects.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Your Projects</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {assignedProjects.map((project) => (
                    <Card key={project.id} className="p-4 sm:p-5">
                      <h3 className="font-bold text-white">{project.name}</h3>
                      <p className="text-sm text-gray-300 mt-1">{project.description}</p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                          project.status === 'completed'
                            ? 'bg-gray-800 text-gray-300'
                            : project.status === 'active'
                            ? 'bg-gray-800 text-gray-300'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {project.status}
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-6">
              {['all', 'todo', 'in-progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as typeof filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {status === 'all' ? 'All Tasks' : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : tasks && tasks.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="p-2 sm:p-4 flex flex-col h-full">
                      {/* Mobile view */}
                      <div className="md:hidden flex flex-col gap-1 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-[11px] font-semibold text-white line-clamp-2 flex-1">
                            {task.title}
                          </h3>
                          <span className={`px-1 py-0.5 text-[7px] rounded-full whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </div>

                        <span className={`px-1 py-0.5 text-[7px] rounded-full inline-block ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </span>

                        {task.grade !== undefined && (
                          <span className={`px-1 py-0.5 text-[7px] rounded-full inline-block ${getGradeColor(task.grade)}`}>
                            {task.grade}/100
                          </span>
                        )}

                        {task.description && (
                          <p className="text-[8px] text-gray-300 line-clamp-2">{task.description}</p>
                        )}

                        {task.projectName && (
                          <p className="text-[7px] text-gray-400">📁 {task.projectName}</p>
                        )}

                        {task.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant={task.status === 'in-progress' ? 'primary' : 'outline'}
                            onClick={() => handleUpdateStatus(
                              task,
                              task.status === 'todo' ? 'in-progress' : 'completed'
                            )}
                            className="mt-auto text-[8px] px-1 py-0.5 h-auto w-full"
                          >
                            {task.status === 'todo' ? 'Start' : 'Done'}
                          </Button>
                        )}
                        {task.status === 'completed' && task.grade === undefined && (
                          <span className="text-yellow-500 font-semibold text-[7px] mt-auto">
                            ⏳ Awaiting
                          </span>
                        )}
                        {task.status === 'completed' && task.grade !== undefined && (
                          <span className="text-green-500 font-semibold text-[7px] mt-auto">
                            ✅ Graded
                          </span>
                        )}
                      </div>

                      {/* Desktop detailed view */}
                      <div className="hidden md:flex md:items-start md:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <h3 className="text-sm font-bold text-white truncate">
                              {task.title}
                            </h3>
                            <span className={`px-1.5 py-0.5 text-[10px] rounded-full whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`px-1.5 py-0.5 text-[10px] rounded-full whitespace-nowrap ${getStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ')}
                            </span>
                            {task.grade !== undefined && (
                              <span className={`px-2 py-0.5 text-xs font-bold rounded-full whitespace-nowrap ${getGradeColor(task.grade)}`}>
                                {task.grade}/100
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-gray-400 mb-1.5">
                            {task.projectName ? `📁 ${task.projectName}` : '⭐ Independent Task'}
                          </p>

                          <p className="text-xs text-gray-300 mb-1.5 line-clamp-2">{task.description}</p>

                          {task.feedback && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 mb-1.5">
                              <p className="text-[10px] font-medium text-gray-300 mb-0.5">Owner Feedback:</p>
                              <p className="text-xs text-gray-300 line-clamp-2">{task.feedback}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span>Created: {formatDateTime(task.createdAt!)}</span>
                            {task.dueDate && (
                              <span className="text-orange-400 font-medium">
                                Due: {formatDateTime(task.dueDate)}
                              </span>
                            )}
                            {task.completedAt && (
                              <span className="text-green-400 font-medium">
                                Completed: {formatDateTime(task.completedAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 ml-2">
                          {task.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant={task.status === 'in-progress' ? 'primary' : 'outline'}
                              onClick={() => handleUpdateStatus(
                                task,
                                task.status === 'todo' ? 'in-progress' : 'completed'
                              )}
                              className="text-xs px-2 py-1 h-auto whitespace-nowrap"
                            >
                              {task.status === 'todo' ? '▶️ Start' : '✓ Done'}
                            </Button>
                          )}
                          {task.status === 'completed' && task.grade === undefined && (
                            <span className="text-yellow-400 font-semibold text-xs whitespace-nowrap">
                              ⏳ Awaiting
                            </span>
                          )}
                          {task.status === 'completed' && task.grade !== undefined && (
                            <span className="text-green-400 font-semibold text-xs whitespace-nowrap">
                              ✅ Graded
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No tasks yet"
                description={
                  filter === 'all'
                    ? "You don't have any assigned tasks yet"
                    : `No ${filter.replace('-', ' ')} tasks`
                }
                icon={
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
