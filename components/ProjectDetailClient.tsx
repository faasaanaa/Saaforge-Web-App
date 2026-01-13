"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useDocument, useCollection } from '@/lib/hooks/useFirestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import { where, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const { user, firebaseUser } = useAuth();
  const { data: project, loading } = useDocument<any>('projects', projectId);
  const { data: allFeedback } = useCollection<any>('projectFeedback', [where('projectId', '==', projectId), orderBy('createdAt', 'desc')]);

  const [feedbackType, setFeedbackType] = useState<'feedback' | 'improvement'>('feedback');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-300 mb-4">Project not found</p>
            <Link href="/projects"><Button>← Back to Projects</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filtered = (allFeedback || []).filter((f: any) => f.type === feedbackType);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 allow-video">
        <div className="relative">
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/projects">
              <Button variant="outline" className="mb-6">← Back to Projects</Button>
            </Link>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white">{project.name}</h1>
              <p className="text-gray-400 text-lg mb-4">{project.description}</p>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {(project.techStack || []).map((t: string) => (
                  <span key={t} className="px-3 py-1 text-sm rounded-full bg-gray-800 text-gray-100 border border-gray-700">{t}</span>
                ))}
              </div>
            </div>

            {/* Case Study / Demo / GitHub Buttons */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3">
                {project.caseStudy && (
                  <div className="w-full">
                    <h4 className="text-lg font-semibold text-white mb-2">Case Study</h4>
                    <div className="text-gray-200 bg-gray-900/40 border border-gray-800 rounded-lg p-4 leading-relaxed">
                      {project.caseStudy}
                    </div>
                  </div>
                )}

                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-2xl bg-blue-900/60 text-blue-200 font-semibold border border-blue-800/60 hover:bg-blue-900/80"
                  >
                    View Demo
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-2xl bg-gray-800/60 text-gray-200 font-semibold border border-gray-700 hover:bg-gray-800/80"
                  >
                    View Code
                  </a>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Community Feedback</h2>
                  <p className="text-gray-400">Help improve this project by sharing your thoughts</p>
                </div>
                <Button onClick={() => {
                  if (!user || !firebaseUser) { window.location.href = '/login'; return; }
                  setShowFeedbackModal(true);
                }}>Share Feedback</Button>
              </div>

              <div className="flex gap-2 mb-6">
                <button onClick={() => setFeedbackType('feedback')} className={feedbackType === 'feedback' ? 'px-4 py-2 rounded-lg bg-blue-600 text-white' : 'px-4 py-2 rounded-lg bg-gray-800 text-gray-400'}>Feedback ({(allFeedback || []).filter((f: any)=>f.type==='feedback').length})</button>
                <button onClick={() => setFeedbackType('improvement')} className={feedbackType === 'improvement' ? 'px-4 py-2 rounded-lg bg-blue-600 text-white' : 'px-4 py-2 rounded-lg bg-gray-800 text-gray-400'}>Improvement Ideas ({(allFeedback || []).filter((f: any)=>f.type==='improvement').length})</button>
              </div>

              <div className="space-y-4">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-lg">
                    <p className="text-gray-400">No items yet. Be the first to share!</p>
                  </div>
                ) : (
                  filtered.map((item: any) => (
                    <div key={item.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-white text-lg">{item.userName}</h4>
                          <p className="text-sm text-gray-300">{item.userEmail}</p>
                        </div>
                      </div>
                      <p className="text-gray-100 mb-4 leading-relaxed">{item.feedback}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showFeedbackModal && project && (
        <FeedbackModal isOpen={showFeedbackModal} projectId={project.id} projectName={project.name} projectType={project.projectType} onClose={() => setShowFeedbackModal(false)} />
      )}
    </div>
  );
}
