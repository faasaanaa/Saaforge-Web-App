'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
// Navbar provided by root layout
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { useCollection } from '@/lib/hooks/useFirestore';
import { Project } from '@/lib/types';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getCategoryIcon, getCategoryColor } from '@/lib/utils/categoryIcons';

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [projectType, setProjectType] = useState<'all' | 'client' | 'company'>('all');
  const [feedbackProject, setFeedbackProject] = useState<Project | null>(null);
  
  const { data: allProjects, loading } = useCollection<Project>('projects', [
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
  ]);

  // Filter projects based on selected type
  const projects = allProjects?.filter((project) => {
    if (projectType === 'all') return true;
    return project.projectType === projectType;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow relative allow-video">
        {/* Galaxy removed */}
        <div className="relative z-10">
        {/* Hero Section (Galaxy behind title) */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Our <span className="premium-text-gradient">Projects</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Explore our portfolio of innovative solutions. From automation to custom software,
                see what we've built for our clients.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Project Type Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-transparent rounded-lg p-1 inline-flex gap-1 border border-gray-800">
                <button
                  onClick={() => setProjectType('all')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    projectType === 'all'
                      ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All Projects
                </button>
                <button
                  onClick={() => setProjectType('company')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    projectType === 'company'
                      ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Our Projects
                </button>
                <button
                  onClick={() => setProjectType('client')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    projectType === 'client'
                      ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Client Delivered
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => router.push(`/project?id=${project.id}`)}
                    className="cursor-pointer"
                  >
                    <Card hover className="h-full flex flex-col">
                      {/* Category Icon at Top */}
                      <div className={`flex items-center justify-center w-10 h-10 md:w-20 md:h-20 rounded-lg mb-2 md:mb-4 ${getCategoryColor(project.category)}`}>
                        <span className="text-xl md:text-4xl">{getCategoryIcon(project.category)}</span>
                      </div>

                      {/* Project Name */}
                      <h3 className="text-sm md:text-xl font-bold text-white mb-2 md:mb-3">
                        {project.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-400 text-xs md:text-sm mb-2 md:mb-4 line-clamp-2 md:line-clamp-3">
                        {project.description}
                      </p>

                      {/* Demo Button */}
                      {project.demoUrl && (
                        <div className="mt-auto">
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs rounded-full bg-blue-900/50 text-blue-300 border border-blue-700/50 hover:bg-blue-900/70 transition-colors"
                          >
                            → Demo
                          </a>
                        </div>
                      )}

                      {/* Status and Type */}
                      <div className="flex items-center gap-1 md:gap-2 pt-2 md:pt-4 mt-2 md:mt-4 border-t border-gray-800">
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                          {project.status}
                        </span>
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                          {project.projectType === 'client' ? '🤝 Client' : '🏢 Company'}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No projects yet"
                description="We're working on exciting projects. Check back soon!"
                icon={
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
              />
            )}
          </div>
        </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
