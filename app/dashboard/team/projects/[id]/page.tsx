'use client';

import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDocument } from '@/lib/hooks/useFirestore';
import { Project } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';

export default function TeamProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || null;
  const { data: project, loading } = useDocument<Project>('projects', id);

  return (
    <ProtectedRoute requiredRole="team">
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl md:text-2xl font-bold text-white">Project Detail</h1>
              <Button variant="outline" size="sm" onClick={() => router.back()}>Back</Button>
            </div>

            <Card className="p-4 sm:p-5">
              {loading || !project ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg md:text-2xl font-bold text-white">{project.name}</h2>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-gray-300">{project.description}</p>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-[10px] md:text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                      {project.projectType === 'client' ? 'Client Project' : 'Company Project'}
                    </span>
                    {project.category && (
                      <span className="px-2 py-1 text-[10px] md:text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                        {project.category}
                      </span>
                    )}
                  </div>

                  {project.techStack?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Live Demo</a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">GitHub Repo</a>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
