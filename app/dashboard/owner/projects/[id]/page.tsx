'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useDocument, updateDocument, deleteDocument } from '@/lib/hooks/useFirestore';
import { Project } from '@/lib/types';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function OwnerProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const id = (params?.id as string) || null;
  const { data: project, loading } = useDocument<Project>('projects', id);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
  });
  const [saving, setSaving] = useState(false);

  // Initialize form when project loads
  if (project && !editing && form.name === '') {
    setForm({
      name: project.name || '',
      description: project.description || '',
      category: project.category || '',
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateDocument<Project>('projects', id, {
        name: form.name,
        description: form.description,
        category: form.category,
      });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update project', err);
      alert('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Delete this project?')) return;
    try {
      await deleteDocument('projects', id);
      router.push('/dashboard/owner/projects');
    } catch (err) {
      console.error('Failed to delete project', err);
      alert('Failed to delete');
    }
  };

  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl md:text-2xl font-bold text-white">Project Detail</h1>
              <div className="flex gap-2">
                {!editing ? (
                  <Button size="sm" onClick={() => setEditing(true)}>Edit</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                )}
                <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
              </div>
            </div>

            <Card className="p-4 sm:p-5">
              {loading || !project ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label="Project Name" name="name" value={form.name} onChange={handleChange} disabled={!editing} />
                    <Input label="Category" name="category" value={form.category} onChange={handleChange} disabled={!editing} placeholder="e.g., Web Development" />
                  </div>
                  <Textarea label="Description" name="description" value={form.description} onChange={handleChange} disabled={!editing} rows={4} />

                  {project.techStack?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className="text-white font-semibold">{project.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <p className="text-white font-semibold">{project.projectType}</p>
                    </div>
                  </div>

                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline text-sm">
                      View Demo
                    </a>
                  )}

                  {editing && (
                    <div className="flex justify-end pt-2 border-t border-gray-700">
                      <Button size="sm" onClick={handleSave} isLoading={saving}>Save Changes</Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
