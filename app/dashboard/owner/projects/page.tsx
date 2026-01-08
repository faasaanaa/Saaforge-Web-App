'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/Loading';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { useCollection } from '@/lib/hooks/useFirestore';
import { createDocument, updateDocument, deleteDocument } from '@/lib/hooks/useFirestore';
import { Project, ProjectStatus } from '@/lib/types';
import { useAuth } from '@/lib/contexts/AuthContext';
import { logAudit } from '@/lib/utils/helpers';

const PROJECT_CATEGORIES = [
  'Web Development',
  'Software Automation',
  'Cloud Computing',
  'Mobile Development',
  'Machine Learning',
  'Data Science',
  'DevOps',
  'Blockchain',
  'API Development',
  'Game Development',
  'E-commerce',
  'SaaS',
  'IoT',
  'Cybersecurity',
  'UI/UX Design',
];

const TECH_STACK_SUGGESTIONS = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'TypeScript', 'JavaScript',
  'Node.js', 'Express.js', 'Python', 'Django', 'Flask', 'FastAPI', 'Java',
  'Spring Boot', 'C#', 'ASP.NET', 'Go', 'Rust', 'Ruby on Rails', 'PHP',
  'Laravel', 'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure', 'Firebase',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API', 'Git',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Flutter', 'React Native', 'Swift',
  'Kotlin', 'Figma', 'Tailwind CSS', 'Bootstrap', 'Sass', 'HTML5', 'CSS3'
];

export default function OwnerProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: projects, loading } = useCollection<Project>('projects');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    techStack: [] as string[],
    status: 'planned' as ProjectStatus,
    projectType: 'company' as 'client' | 'company',
    isFeatured: false,
    isPublished: false,
    caseStudy: '',
    demoUrl: '',
    githubUrl: '',
  });
  const [saving, setSaving] = useState(false);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      category: project.category || '',
      techStack: project.techStack,
      status: project.status,
      projectType: project.projectType,
      isFeatured: project.isFeatured,
      isPublished: project.isPublished,
      caseStudy: project.caseStudy || '',
      demoUrl: project.demoUrl || '',
      githubUrl: project.githubUrl || '',
    });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      techStack: [],
      status: 'planned',
      projectType: 'company',
      isFeatured: false,
      isPublished: false,
      caseStudy: '',
      demoUrl: '',
      githubUrl: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // Generate unique clientId for client projects
      const clientId = formData.projectType === 'client' 
        ? `CL-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        : undefined;

      const projectData: any = {
        name: formData.name,
        description: formData.description,
        techStack: formData.techStack,
        status: formData.status,
        projectType: formData.projectType,
        clientId: editingProject?.clientId || clientId,
        isFeatured: formData.isFeatured,
        isPublished: formData.isPublished,
        assignedMembers: editingProject?.assignedMembers || [],
        createdBy: user.uid,
      };

      // Only include optional fields if they have values
      if (formData.category) projectData.category = formData.category;
      if (formData.caseStudy) projectData.caseStudy = formData.caseStudy;
      if (formData.demoUrl) projectData.demoUrl = formData.demoUrl;
      if (formData.githubUrl) projectData.githubUrl = formData.githubUrl;

      if (editingProject) {
        await updateDocument<Project>('projects', editingProject.id, projectData);
        await logAudit('project.updated', user.uid, { projectId: editingProject.id, name: formData.name });
      } else {
        const newProject = await createDocument<Project>('projects', projectData);
        await logAudit('project.created', user.uid, { projectId: newProject.id, name: formData.name });
      }

      setShowModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return;

    try {
      await deleteDocument('projects', project.id);
      await logAudit('project.deleted', user.uid, { projectId: project.id, name: project.name });
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
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

              <Button onClick={handleNew}>+ New Project</Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="p-2 sm:p-4 flex flex-col h-full">
                      {/* Mobile view */}
                      <div className="md:hidden flex flex-col gap-1 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-[11px] font-semibold text-white line-clamp-2 flex-1">{project.name}</h3>
                          <span className="px-1 py-0.5 text-[7px] rounded-full bg-purple-600 text-purple-100 border border-purple-500 whitespace-nowrap">
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-0.5">
                          {project.category && (
                            <span className="px-1 py-0.5 text-[7px] rounded-full bg-blue-600 text-blue-100 border border-blue-500">
                              {project.category}
                            </span>
                          )}
                          {project.projectType === 'client' && (
                            <span className="px-1 py-0.5 text-[7px] rounded-full bg-indigo-600 text-indigo-100 border border-indigo-500">
                              Client
                            </span>
                          )}
                        </div>

                        {project.description && (
                          <p className="text-[8px] text-gray-300 line-clamp-2">{project.description}</p>
                        )}

                        {project.techStack && project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-0.5">
                            {project.techStack.slice(0, 3).map((tech) => (
                              <span key={tech} className="px-1 py-0.5 text-[7px] bg-gray-800 text-gray-300 rounded">
                                {tech}
                              </span>
                            ))}
                            {project.techStack.length > 3 && (
                              <span className="px-1 py-0.5 text-[7px] bg-gray-800 text-gray-300 rounded">
                                +{project.techStack.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex gap-1 mt-auto w-full">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/owner/projects/${project.id}`)} className="flex-1 text-[8px] px-1 py-0.5 h-auto">
                            View
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(project)} className="flex-1 text-[8px] px-1 py-0.5 h-auto">
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Desktop detailed view */}
                      <div className="hidden md:flex md:flex-col md:flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">
                            {project.name}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs rounded-full ${
                              project.status === 'completed'
                                ? 'bg-gray-800 text-gray-300'
                                : project.status === 'active'
                                ? 'bg-gray-800 text-gray-300'
                                : 'bg-gray-800 text-gray-300'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.category && (
                            <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-900/50 to-purple-800/50 text-purple-300 border border-purple-700/50">
                              {project.category}
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              project.projectType === 'client'
                                ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50'
                                : 'bg-gray-800 text-gray-300 border border-gray-700/50'
                            }`}
                          >
                            {project.projectType === 'client' ? '🤝 Client' : '🏢 Company'}
                          </span>
                          {project.isPublished && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700/50">
                              Published
                            </span>
                          )}
                          {project.isFeatured && (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-900/50 text-yellow-300 border border-yellow-700/50">
                              ⭐ Featured
                            </span>
                          )}
                        </div>

                        <p className="text-gray-400 text-sm mb-4">{project.description}</p>

                        {project.clientId && (
                          <div className="mb-2 p-2 bg-indigo-900/30 border border-indigo-700/50 rounded">
                            <p className="text-xs text-indigo-300 font-mono">
                              <strong>Client ID:</strong> {project.clientId}
                            </p>
                            <p className="text-xs text-indigo-400 mt-1">
                              Share this ID with clients for feedback
                            </p>
                          </div>
                        )}

                        {project.techStack.length > 0 && (
                          <div className="relative mb-4 group">
                            <div className="flex flex-wrap gap-2">
                              {project.techStack.slice(0, 3).map((tech) => (
                                <span
                                  key={tech}
                                  className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.techStack.length > 3 && (
                                <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-full border border-gray-700">
                                  +{project.techStack.length - 3} more
                                </span>
                              )}
                            </div>
                            
                            {/* Tech Stack Overlay on Hover */}
                            <div className="absolute left-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto">
                              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-max max-w-xs">
                                <p className="text-xs font-semibold text-gray-300 mb-2">Tech Stack</p>
                                <div className="flex flex-wrap gap-2">
                                  {project.techStack.map((tech) => (
                                    <span
                                      key={tech}
                                      className="px-2 py-1 bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-purple-300 text-xs rounded-full border border-purple-700/50"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-3 border-t border-gray-700">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(project)}>
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
                title="No projects yet"
                description="Create your first project to showcase your work."
                action={<Button onClick={handleNew}>+ Create Project</Button>}
                icon={
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          </motion.div>
        </div>

        {/* Project Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingProject ? 'Edit Project' : 'New Project'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="My Awesome Project"
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              placeholder="Brief description of the project"
            />

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Project Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a category</option>
                {PROJECT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <AutocompleteInput
              label="Tech Stack"
              value={formData.techStack}
              onChange={(values) => setFormData({ ...formData, techStack: values })}
              suggestions={TECH_STACK_SUGGESTIONS}
              placeholder="Start typing to add technologies..."
              helperText="Add technologies used in this project"
            />

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Project Type</label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value as 'client' | 'company' })}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="company">Company Project</option>
                <option value="client">Client Delivered Project</option>
              </select>
            </div>

            <Textarea
              label="Case Study (Optional)"
              value={formData.caseStudy}
              onChange={(e) => setFormData({ ...formData, caseStudy: e.target.value })}
              rows={3}
              placeholder="Detailed case study or project notes"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Demo URL"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                placeholder="https://demo.example.com"
              />

              <Input
                label="GitHub URL"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-200">Publish on public projects page</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-200">Feature on homepage</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" isLoading={saving}>
                {editingProject ? 'Update' : 'Create'} Project
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
