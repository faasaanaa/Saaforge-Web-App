'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useCollection, createDocument } from '@/lib/hooks/useFirestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { ProjectIdea } from '@/lib/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/Loading';
import { orderBy } from 'firebase/firestore';

export default function TeamIdeasPage() {
  const { user, firebaseUser } = useAuth();
  const { data: allIdeas, loading } = useCollection<ProjectIdea>('projectIdeas', [
    orderBy('createdAt', 'desc'),
  ]);
  const { markAsViewed } = useNotifications();

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    estimatedDuration: '',
  });

  useEffect(() => {
    markAsViewed('ideas');
  }, [markAsViewed]);

  const handleSubmitIdea = async () => {
    if (!user || !firebaseUser) {
      alert('Please login to submit an idea');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const techStackArray = formData.techStack
        .split(',')
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0);

      await createDocument<ProjectIdea>('projectIdeas', {
        title: formData.title,
        description: formData.description,
        submittedBy: user.uid,
        submitterName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
        submitterEmail: firebaseUser.email || '',
        proposedTechStack: techStackArray,
        estimatedDuration: formData.estimatedDuration || undefined,
        status: 'pending',
      } as any);

      setFormData({ title: '', description: '', techStack: '', estimatedDuration: '' });
      setShowForm(false);
      alert('Your new project idea has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting idea:', error);
      alert('Failed to submit idea. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="team">
        <DashboardLayout>
          <LoadingSpinner />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="team">
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>

                <p className="text-gray-400 mt-2">
                  Submit and view new project ideas to start fresh projects
                </p>
              </div>
              <Button onClick={() => setShowForm(!showForm)}>
                💡 {showForm ? 'Cancel' : 'Submit Idea'}
              </Button>
            </div>

            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-8 bg-gray-800 border border-gray-700">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Submit Your New Project Idea</h2>

                    <Input
                      label="Project Title"
                      placeholder="e.g., AI-Powered Task Manager"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your new project idea, its goals, and potential impact..."
                        className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-900 text-white"
                        rows={5}
                        required
                      />
                    </div>

                    <Input
                      label="Proposed Tech Stack"
                      placeholder="e.g., React, Tailwind CSS (comma-separated)"
                      value={formData.techStack}
                      onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    />

                    <Input
                      label="Estimated Duration"
                      placeholder="e.g., 1-2 weeks"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    />

                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSubmitIdea} isLoading={submitting} className="flex-1">
                        Submit Idea
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {allIdeas && allIdeas.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {allIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="p-2 sm:p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-[11px] font-bold text-white line-clamp-2">
                            {idea.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-0.5 flex-wrap">
                          <span
                              className={`px-1.5 py-0.5 rounded-full text-[7px] font-medium ${
                                idea.status === 'pending'
                                  ? 'bg-amber-900/50 text-amber-300'
                                  : idea.status === 'approved'
                                  ? 'bg-emerald-900/50 text-emerald-300'
                                  : idea.status === 'in-progress'
                                  ? 'bg-blue-900/50 text-blue-300'
                                  : 'bg-red-900/50 text-red-300'
                              }`}
                            >
                              {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                            </span>
                          </div>

                          <p className="text-[8px] text-gray-300 line-clamp-2">{idea.description}</p>

                          {idea.proposedTechStack && idea.proposedTechStack.length > 0 && (
                            <div className="flex flex-wrap gap-0.5">
                              {idea.proposedTechStack.slice(0, 2).map((tech) => (
                                <span
                                  key={tech}
                                  className="px-1 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[7px] border border-gray-700"
                                >
                                  {tech}
                                </span>
                              ))}
                              {idea.proposedTechStack.length > 2 && (
                                <span className="px-1 py-0.5 text-[7px] text-gray-400">
                                  +{idea.proposedTechStack.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="text-[7px] text-gray-400 pt-1 border-t border-gray-700">
                            {idea.submitterName}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Project Ideas Yet"
                description="Submit your first project idea to start something new!"
              />
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
