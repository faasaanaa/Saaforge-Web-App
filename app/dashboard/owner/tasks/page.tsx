'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCollection, createDocument, updateDocument, deleteDocument } from '@/lib/hooks/useFirestore';
import { Project, TeamProfile, Task } from '@/lib/types';
import { formatDate } from '@/lib/utils/helpers';
import { Timestamp, where } from 'firebase/firestore';

export default function ManageTasksPage() {
  const { user } = useAuth();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [gradingTask, setGradingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assignedTo: '',
    dueDate: '',
  });
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: '',
  });

  const { data: tasks, loading } = useCollection<Task>('tasks');
  const { data: projects } = useCollection<Project>('projects');
  const { data: teamMembers } = useCollection<TeamProfile>('teamProfiles', [
    where('isApproved', '==', true),
  ]);

  const activeTasks = tasks?.filter(t => t.status !== 'completed') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  const handleNew = () => {
    setEditingTask(null);
    setFormData({
      projectId: '',
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
    });
    setShowTaskModal(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      projectId: task.projectId || '',
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate ? new Date(task.dueDate.toMillis()).toISOString().slice(0, 16) : '',
    });
    setShowTaskModal(true);
  };

  const handleGrade = (task: Task) => {
    setGradingTask(task);
    setGradeData({
      grade: task.grade?.toString() || '',
      feedback: task.feedback || '',
    });
    setShowGradeModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGradeData({
      ...gradeData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const member = teamMembers?.find(m => m.userId === formData.assignedTo);
      
      if (!member) {
        alert('Please select a valid team member');
        return;
      }

      let project = null;
      if (formData.projectId) {
        project = projects?.find(p => p.id === formData.projectId);
        if (!project) {
          alert('Selected project not found');
          return;
        }
      }

      const taskData: any = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        assignedToName: member.name,
        assignedBy: user.uid,
        status: editingTask?.status || ('todo' as const),
      };

      // Only include optional fields if they have values
      if (formData.projectId) {
        taskData.projectId = formData.projectId;
        if (project?.name) {
          taskData.projectName = project.name;
        }
      }
      
      if (formData.dueDate) {
        taskData.dueDate = Timestamp.fromDate(new Date(formData.dueDate));
      }

      if (editingTask) {
        await updateDocument<Task>('tasks', editingTask.id!, {
          ...taskData,
          updatedAt: Timestamp.now(),
        });
      } else {
        await createDocument<Task>('tasks', taskData);
      }

      setShowTaskModal(false);
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !gradingTask) return;

    const grade = parseInt(gradeData.grade);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert('Grade must be between 0 and 100');
      return;
    }

    try {
      await updateDocument<Task>('tasks', gradingTask.id!, {
        grade,
        feedback: gradeData.feedback,
        gradedBy: user.uid,
        gradedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setShowGradeModal(false);
    } catch (error) {
      console.error('Failed to submit grade:', error);
      alert('Failed to submit grade. Please try again.');
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;

    try {
      await deleteDocument('tasks', task.id!);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'bg-gray-800 text-gray-300';
    if (grade >= 70) return 'bg-gray-800 text-gray-300';
    if (grade >= 50) return 'bg-gray-800 text-gray-300';
    return 'bg-gray-800 text-gray-300';
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
            <div className="flex items-center justify-between mb-8">

              <Button onClick={handleNew}>+ New Task</Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Active Tasks */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Active Tasks</h2>
                  {activeTasks.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                      {activeTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <Card className="p-2 sm:p-4 flex flex-col h-full">
                            {/* Mobile view */}
                            <div className="md:hidden flex flex-col gap-1 flex-1">
                              <div className="flex items-start justify-between gap-1">
                                <h3 className="text-[11px] font-semibold text-white line-clamp-2 flex-1">{task.title}</h3>
                                <span className={`px-1 py-0.5 text-[7px] rounded-full whitespace-nowrap ${
                                  task.priority === 'high' ? 'bg-red-600 text-red-100 border border-red-500' :
                                  task.priority === 'medium' ? 'bg-yellow-600 text-yellow-100 border border-yellow-500' :
                                  'bg-green-600 text-green-100 border border-green-500'
                                }`}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                              </div>

                              <span className="px-1 py-0.5 text-[7px] rounded-full bg-blue-600 text-blue-100 border border-blue-500 inline-block">
                                {task.status.replace('-', ' ')}
                              </span>

                              {task.description && (
                                <p className="text-[8px] text-gray-300 line-clamp-2">{task.description}</p>
                              )}

                              {task.projectName && (
                                <p className="text-[7px] text-gray-400">📁 {task.projectName}</p>
                              )}

                              <div className="flex gap-1 mt-auto w-full">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(task)} className="flex-1 text-[8px] px-1 py-0.5 h-auto">
                                  Edit
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(task)} className="flex-1 text-[8px] px-1 py-0.5 h-auto">
                                  Delete
                                </Button>
                              </div>
                            </div>

                            {/* Desktop detailed view */}
                            <div className="hidden md:flex md:items-start md:justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <h3 className="text-sm font-bold text-white truncate">{task.title}</h3>
                                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full whitespace-nowrap ${
                                    task.priority === 'high' ? 'bg-gray-800 text-gray-300' :
                                    task.priority === 'medium' ? 'bg-gray-800 text-gray-300' :
                                    'bg-gray-800 text-gray-300'
                                  }`}>
                                    {task.priority}
                                  </span>
                                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full whitespace-nowrap ${
                                    task.status === 'in-progress' ? 'bg-gray-800 text-gray-300' :
                                    'bg-gray-800 text-gray-300'
                                  }`}>
                                    {task.status}
                                  </span>
                                </div>

                                <p className="text-xs text-gray-300 mb-1.5 line-clamp-2">{task.description}</p>
                                
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                  {task.projectName ? (
                                    <span>📁 {task.projectName}</span>
                                  ) : (
                                    <span className="text-purple-600 font-medium">⭐ Independent Task</span>
                                  )}
                                  <span>👤 {task.assignedToName}</span>
                                  {task.dueDate && (
                                    <span>📅 Due: {formatDate(task.dueDate as any)}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2 ml-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
                                  Edit
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(task)}>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No active tasks"
                      description="All tasks are completed"
                      icon={
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      }
                    />
                  )}
                </div>

                {/* Completed Tasks */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">Completed Tasks</h2>
                  {completedTasks.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                      {completedTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <Card className="p-2 sm:p-4 flex flex-col h-full">
                            {/* Mobile view */}
                            <div className="md:hidden flex flex-col gap-1 flex-1">
                              <div className="flex items-start justify-between gap-1">
                                <h3 className="text-[11px] font-semibold text-white line-clamp-2 flex-1">{task.title}</h3>
                                <span className="px-1 py-0.5 text-[7px] rounded-full bg-green-600 text-green-100 border border-green-500 whitespace-nowrap">
                                  Complete
                                </span>
                              </div>

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

                              <div className="flex gap-1 mt-auto w-full">
                                <Button 
                                  variant={task.grade !== undefined ? 'outline' : 'primary'}
                                  size="sm" 
                                  onClick={() => handleGrade(task)}
                                  className="flex-1 text-[8px] px-1 py-0.5 h-auto"
                                >
                                  {task.grade !== undefined ? 'Re-gr' : 'Grade'}
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(task)} className="flex-1 text-[8px] px-1 py-0.5 h-auto">
                                  Delete
                                </Button>
                              </div>
                            </div>

                            {/* Desktop detailed view */}
                            <div className="hidden md:flex md:items-start md:justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <h3 className="text-sm font-bold text-white truncate">{task.title}</h3>
                                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gray-800 text-gray-300 whitespace-nowrap">
                                    Completed
                                  </span>
                                  {task.grade !== undefined && (
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full whitespace-nowrap ${getGradeColor(task.grade)}`}>
                                      {task.grade}/100
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-gray-300 mb-1.5 line-clamp-2">{task.description}</p>
                                
                                {task.feedback && (
                                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 mb-1.5">
                                    <p className="text-[10px] font-medium text-gray-300 mb-0.5">Feedback:</p>
                                    <p className="text-xs text-gray-300 line-clamp-2">{task.feedback}</p>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                  {task.projectName ? (
                                    <span>📁 {task.projectName}</span>
                                  ) : (
                                    <span className="text-purple-600 font-medium">⭐ Independent Task</span>
                                  )}
                                  <span>👤 {task.assignedToName}</span>
                                  {task.completedAt && (
                                    <span>✅ {formatDate(task.completedAt as any)}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2 ml-2">
                                <Button 
                                  variant={task.grade !== undefined ? 'outline' : 'primary'}
                                  size="sm" 
                                  onClick={() => handleGrade(task)}
                                >
                                  {task.grade !== undefined ? 'Re-grade' : 'Grade'}
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(task)}>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No completed tasks"
                      description="Completed tasks will appear here"
                      icon={
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Task Modal */}
        <Modal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          title={editingTask ? 'Edit Task' : 'New Task'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Project (Optional - leave blank for independent task)
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="">Independent Task (no project)</option>
                {projects?.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Assign To *
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              >
                <option value="">Select team member</option>
                {teamMembers?.map(member => (
                  <option key={member.userId} value={member.userId}>{member.name} ({member.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Task title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Description *
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Task details"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Grade Modal */}
        <Modal
          isOpen={showGradeModal}
          onClose={() => setShowGradeModal(false)}
          title={gradingTask?.grade !== undefined ? 'Re-grade Task' : 'Grade Task'}
        >
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <div>
              <h3 className="font-bold text-white mb-2">{gradingTask?.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{gradingTask?.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Grade (0-100) *
              </label>
              <Input
                type="number"
                name="grade"
                value={gradeData.grade}
                onChange={handleGradeChange}
                placeholder="Enter grade"
                min="0"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Feedback *
              </label>
              <Textarea
                name="feedback"
                value={gradeData.feedback}
                onChange={handleGradeChange}
                placeholder="Provide feedback on the task completion"
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Submit Grade
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowGradeModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
