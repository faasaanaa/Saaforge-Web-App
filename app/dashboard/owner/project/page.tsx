'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useDocument, useCollection, updateDocument } from '@/lib/hooks/useFirestore';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Project, TeamProfile } from '@/lib/types';
import { motion } from 'framer-motion';

function ProjectDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = searchParams?.get('id');
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);

  const { data: project, loading, error } = useDocument<Project>(
    'projects',
    projectId
  );

  const { data: allTeamMembers } = useCollection<TeamProfile>('teamProfiles');

  useEffect(() => {
    if (project?.assignedMembers) {
      setAssignedMembers(project.assignedMembers);
    }
  }, [project]);

  const handleToggleMember = (memberId: string) => {
    setAssignedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!projectId) return;
    setSavingAssignments(true);
    try {
      await updateDocument<Project>('projects', projectId, {
        assignedMembers,
      });
      alert('Team assignments updated successfully!');
    } catch (error) {
      alert('Failed to update assignments. Please try again.');
    } finally {
      setSavingAssignments(false);
    }
  };

  if (!projectId) {
    return (
      <EmptyState
        title="No project selected"
        description="Select a project from the projects list"
        icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
      />
    );
  }

  if (loading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  if (error || !project) {
    return (
      <EmptyState
        title="Project not found"
        description="The project you're looking for doesn't exist"
        icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2" /></svg>}
      />
    );
  }

  const approvedMembers = allTeamMembers?.filter(m => m.isApproved && !m.id.includes('@')) || [];

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
      >
        ← Back
      </button>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          <span className="px-3 py-1 text-sm rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50">
            {project.status}
          </span>
        </div>

        {project.description && (
          <p className="text-gray-300 mb-4">{project.description}</p>
        )}

        {project.category && (
          <p className="text-sm text-gray-400 mb-4">
            <strong>Category:</strong> {project.category}
          </p>
        )}

        {project.techStack && project.techStack.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span key={tech} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assign Team Members */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Assign Team Members</h2>
        
        {approvedMembers.length === 0 ? (
          <p className="text-gray-400">No approved team members available to assign.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {approvedMembers.map((member) => (
                <motion.label
                  key={member.id}
                  className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <input
                    type="checkbox"
                    checked={assignedMembers.includes(member.id)}
                    onChange={() => handleToggleMember(member.id)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-white">{member.name || 'Unnamed'}</p>
                    {member.role && <p className="text-xs text-gray-400">{member.role}</p>}
                  </div>
                  {assignedMembers.includes(member.id) && (
                    <span className="text-sm text-green-400 font-semibold">✓ Assigned</span>
                  )}
                </motion.label>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveAssignments}
                isLoading={savingAssignments}
                className="flex-1"
              >
                Save Assignments
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <ProjectDetailContent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
