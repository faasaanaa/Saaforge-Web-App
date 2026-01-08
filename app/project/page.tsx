'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useDocument, useCollection } from '@/lib/hooks/useFirestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Project, ProjectFeedback } from '@/lib/types';
import { where, orderBy } from 'firebase/firestore';
import { getCategoryIcon, getCategoryColor } from '@/lib/utils/categoryIcons';

function ProjectDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams?.get('id') || '';
  const { user, firebaseUser } = useAuth();
  const { data: project, loading } = useDocument<Project>('projects', id);
  const { data: allFeedback } = useCollection<ProjectFeedback>('projectFeedback', [
    where('projectId', '==', id),
    orderBy('createdAt', 'desc'),
  ]);

  const [feedbackType, setFeedbackType] = useState<'feedback' | 'improvement'>('feedback');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Filter feedback based on type
  const filteredFeedback = allFeedback?.filter((f) => f.type === feedbackType) || [];

  const handleOpenFeedbackModal = () => {
    if (!user || !firebaseUser) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    setShowFeedbackModal(true);
  };

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">No project ID provided</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-300 mb-4">Project not found</p>
            <Link href="/projects">
              <Button>← Back to Projects</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = getCategoryIcon(project.category);
  const categoryColor = getCategoryColor(project.category);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <Link href="/projects">
            <Button variant="outline" className="mb-6">
              ← Back to Projects
            </Button>
          </Link>

          {/* Project Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${categoryColor} flex items-center justify-center flex-shrink-0`}>
                <div className="w-10 h-10 text-white text-3xl flex items-center justify-center">
                  {Icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{project.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active' 
                      ? 'bg-green-500/20 text-green-400'
                      : project.status === 'completed'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-400 text-lg mb-4">{project.description}</p>

                {/* Primary links */}
                {(project.demoUrl || project.githubUrl) && (
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition"
                      >
                        <span>Live Demo</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-8 8A1 1 0 018.707 16l-4-4A1 1 0 015 10.586l8-8zM13 5.414L6.414 12 8 13.586 14.586 7H13V5.414z" />
                        </svg>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-200 text-sm font-semibold border border-gray-700 hover:bg-gray-700 transition"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        <span>View on GitHub</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Project Links */}
            {project.githubUrl && (
              <div className="flex gap-4">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            )}
          </motion.div>

          {/* Feedback Section */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 border border-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Community Feedback</h2>
                <p className="text-gray-400">Help improve this project by sharing your thoughts</p>
              </div>
              <Button onClick={handleOpenFeedbackModal}>
                Share Feedback
              </Button>
            </div>

            {/* Feedback Type Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setFeedbackType('feedback')}
                className={`px-4 py-2 rounded-lg transition ${
                  feedbackType === 'feedback'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Feedback ({allFeedback?.filter(f => f.type === 'feedback').length || 0})
              </button>
              <button
                onClick={() => setFeedbackType('improvement')}
                className={`px-4 py-2 rounded-lg transition ${
                  feedbackType === 'improvement'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Improvement Ideas ({allFeedback?.filter(f => f.type === 'improvement').length || 0})
              </button>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.length === 0 ? (
                <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-lg">
                  <p className="text-gray-400">
                    No {feedbackType === 'feedback' ? 'feedback' : 'improvement ideas'} yet. Be the first to share!
                  </p>
                </div>
              ) : (
                filteredFeedback.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div>
                        <h4 className="font-bold text-white text-lg">{item.userName}</h4>
                        <p className="text-sm text-gray-300">{item.userEmail}</p>
                      </div>
                      {item.rating && feedbackType === 'feedback' && (
                        <div className="inline-flex gap-1 items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span 
                              key={i} 
                              className="text-xl text-white font-semibold opacity-100 hover:opacity-80 transform hover:scale-110 transition-all duration-200"
                            >
                              {i < (item.rating || 0) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-100 mb-4 leading-relaxed">{item.feedback}</p>
                    {item.suggestions && (
                      <div className="text-sm text-gray-200 bg-gradient-to-br from-gray-900/40 to-gray-800/40 border border-gray-700/50 rounded-lg p-4">
                        <strong className="block mb-1">Suggestions:</strong>
                        {item.suggestions}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Feedback Modal */}
      {showFeedbackModal && project && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          projectId={project.id}
          projectName={project.name}
          projectType={project.projectType}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProjectDetailContent />
    </Suspense>
  );
}
