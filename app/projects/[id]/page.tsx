'use client';

import { useState, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
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

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailPage(props: PageProps) {
  const { id } = use(props.params);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Project not found</h2>
            <Link href="/projects">
              <Button>Back to Projects</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-black via-gray-900 to-black py-16">
          <div className="max-w-4xl mx-auto px-4">
            <Link href="/projects" className="text-purple-400 hover:text-purple-300 mb-6 inline-flex items-center gap-2">
              <span>←</span> Back to Projects
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-lg mb-4 md:mb-6 ${getCategoryColor(project.category)}`}>
                <span className="text-3xl md:text-5xl">{getCategoryIcon(project.category)}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{project.name}</h1>
              <p className="text-base md:text-xl text-gray-300 mb-4 md:mb-6">{project.description}</p>

              <div className="flex flex-wrap gap-3">
                {project.category && (
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(project.category)}`}>
                    {project.category}
                  </span>
                )}
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-800 text-gray-300 border border-gray-700">
                  {project.status}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  project.projectType === 'client'
                    ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50'
                    : 'bg-orange-900/50 text-orange-300 border border-orange-700/50'
                }`}>
                  {project.projectType === 'client' ? '🤝 Client Project' : '🏢 Company Project'}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8 mb-12"
            >
              {/* Main Content */}
              <div className="md:col-span-2 space-y-8">
                {/* Case Study */}
                {project.caseStudy && (
                  <div className="crystal-glass rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Case Study</h2>
                    <p className="text-gray-300 whitespace-pre-wrap">{project.caseStudy}</p>
                  </div>
                )}

                {/* Tech Stack */}
                {project.techStack.length > 0 && (
                  <div className="crystal-glass rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Tech Stack</h2>
                    <div className="flex flex-wrap gap-3">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-4 py-2 bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-purple-300 rounded-full border border-purple-700/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-4">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-blue-900/50 text-blue-300 rounded-lg border border-blue-700/50 hover:bg-blue-900/70 transition-colors"
                    >
                      → View Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
                    >
                      → GitHub Repository
                    </a>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Feedback/Ideas Section */}
                <div className="crystal-glass rounded-lg p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4">Share Your Thoughts</h3>

                  {/* Type Toggle */}
                  <div className="bg-gray-900 rounded-lg p-1 inline-flex gap-1 border border-gray-800 mb-4 w-full">
                    <button
                      onClick={() => setFeedbackType('feedback')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        feedbackType === 'feedback'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg border border-purple-500'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      💬 Feedback
                    </button>
                    <button
                      onClick={() => setFeedbackType('improvement')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        feedbackType === 'improvement'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg border border-purple-500'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      💡 Ideas
                    </button>
                  </div>

                  {/* Project Type Info */}
                  {project.projectType === 'client' && feedbackType === 'feedback' && (
                    <p className="text-xs text-yellow-400 mb-3 bg-yellow-900/20 border border-yellow-700/30 rounded p-2">
                      ℹ️ Client ID required to submit feedback
                    </p>
                  )}

                  {!user && (
                    <p className="text-xs text-blue-400 mb-3 bg-blue-900/20 border border-blue-700/30 rounded p-2">
                      🔐 Please login to submit {feedbackType === 'feedback' ? 'feedback' : 'improvement ideas'}
                    </p>
                  )}

                  <Button
                    onClick={handleOpenFeedbackModal}
                    className="w-full"
                  >
                    {user ? 'Submit ' : 'Login to Submit '}
                    {feedbackType === 'feedback' ? 'Feedback' : 'Idea'}
                  </Button>
                </div>

                {/* Feedback Count */}
                <div className="text-sm text-gray-400 text-center">
                  {filteredFeedback.length} {feedbackType === 'feedback' ? 'feedback' : 'idea'}{filteredFeedback.length !== 1 ? 's' : ''}
                </div>
              </div>
            </motion.div>

            {/* Feedback Modal */}
            {project && (
              <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                projectId={project.id}
                projectName={project.name}
                projectType={project.projectType}
                requiresClientId={project.projectType === 'client'}
              />
            )}

            {/* Feedbacks/Ideas List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">
                {feedbackType === 'feedback' ? '💬 Feedback' : '💡 Improvement Ideas'}
              </h2>

              {filteredFeedback.length > 0 ? (
                <div className="space-y-4">
                  {filteredFeedback.map((item) => (
                    <div key={item.id} className="crystal-glass rounded-lg p-4 md:p-6 border border-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg hover:shadow-2xl hover:border-purple-500/40 transition-all duration-300">
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
                                {i < item.rating ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-100 mb-4 leading-relaxed">{item.feedback}</p>
                      {item.suggestions && (
                        <div className="text-sm text-gray-200 bg-gradient-to-br from-gray-900/40 to-gray-800/40 border border-gray-700/50 rounded-lg p-4">
                          <p className="font-semibold text-gray-100 mb-2 uppercase tracking-wide">📝 Additional Details:</p>
                          <p className="leading-relaxed">{item.suggestions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="crystal-glass rounded-lg p-8 text-center border border-gray-700/50">
                  <p className="text-gray-300 mb-4 text-lg">
                    No {feedbackType === 'feedback' ? 'feedback' : 'improvement ideas'} yet
                  </p>
                  <Button onClick={handleOpenFeedbackModal} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    ✨ Be the first to share!
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
