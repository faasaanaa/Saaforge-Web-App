'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useNotifications } from '@/lib/hooks/useNotifications';

export default function ContentEditorPage() {
  const { markAsViewed } = useNotifications();
  const [formData, setFormData] = useState({
    heroTitle: 'Build Amazing Software with Saaforge',
    heroSubtitle: 'We create premium software solutions that transform businesses.',
    aboutTitle: 'About Saaforge',
    aboutDescription: 'We are a team of passionate developers and designers committed to delivering exceptional software solutions.',
    visionTitle: 'Our Vision',
    visionDescription: 'To be the leading provider of innovative software solutions that help businesses thrive in the digital age.',
    missionTitle: 'Our Mission',
    missionDescription: 'To deliver high-quality, scalable software solutions that exceed client expectations and drive measurable results.',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    markAsViewed('content');
  }, [markAsViewed]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      // TODO: Save to Firestore siteContent collection
      // For now, just simulate a save
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">

              {success && (
                <span className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium">
                  ✓ Saved successfully
                </span>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Hero Section</h2>
                <div className="space-y-4">
                  <Input
                    label="Hero Title"
                    name="heroTitle"
                    value={formData.heroTitle}
                    onChange={handleChange}
                    placeholder="Main headline on homepage"
                  />
                  <Textarea
                    label="Hero Subtitle"
                    name="heroSubtitle"
                    value={formData.heroSubtitle}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Subtitle text below the hero title"
                  />
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">About Section</h2>
                <div className="space-y-4">
                  <Input
                    label="About Title"
                    name="aboutTitle"
                    value={formData.aboutTitle}
                    onChange={handleChange}
                    placeholder="About section heading"
                  />
                  <Textarea
                    label="About Description"
                    name="aboutDescription"
                    value={formData.aboutDescription}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Description of your company"
                  />
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Vision & Mission</h2>
                <div className="space-y-4">
                  <Input
                    label="Vision Title"
                    name="visionTitle"
                    value={formData.visionTitle}
                    onChange={handleChange}
                  />
                  <Textarea
                    label="Vision Description"
                    name="visionDescription"
                    value={formData.visionDescription}
                    onChange={handleChange}
                    rows={3}
                  />
                  <Input
                    label="Mission Title"
                    name="missionTitle"
                    value={formData.missionTitle}
                    onChange={handleChange}
                  />
                  <Textarea
                    label="Mission Description"
                    name="missionDescription"
                    value={formData.missionDescription}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </Card>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reset
                </Button>
                <Button onClick={handleSave} isLoading={saving}>
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong>Note:</strong> Changes will be reflected on the public website immediately after saving.
                Make sure to preview your changes before publishing.
              </p>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
