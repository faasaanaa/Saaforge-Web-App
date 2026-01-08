'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCollection, updateDocument, deleteDocument, createDocument } from '@/lib/hooks/useFirestore';
import { JoinRequest, InviteCode, TeamProfile } from '@/lib/types';
import { where, Timestamp } from 'firebase/firestore';
import { logAudit } from '@/lib/utils/helpers';

function OnboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const code = searchParams?.get('code') || '';

  const { data: inviteCodes } = useCollection<InviteCode>('inviteCodes', [
    where('code', '==', code),
  ]);
  const { data: joinRequests } = useCollection<JoinRequest>('joinRequests');

  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [joinRequest, setJoinRequest] = useState<JoinRequest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    role: '',
    skills: [] as string[],
    interests: [] as string[],
    achievements: [] as string[],
    githubUrl: '',
    linkedinUrl: '',
  });
  const [visibility, setVisibility] = useState({
    linkedinUrl: true,
    email: true,
    githubUrl: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) {
      setError('No invite code provided');
      setLoading(false);
      return;
    }

    if (inviteCodes && inviteCodes.length > 0) {
      const invite = inviteCodes[0];
      
      // Check if code is expired
      const now = new Date();
      const expiresAt = invite.expiresAt.toDate();
      if (now > expiresAt) {
        setError('This invite code has expired (24 hours)');
        setLoading(false);
        return;
      }

      // Check if code is already used
      if (invite.isUsed) {
        setError('This invite code has already been used');
        setLoading(false);
        return;
      }

      setInviteCode(invite);

      // Find related join request
      if (joinRequests && invite.requestId) {
        const request = joinRequests.find(r => r.id === invite.requestId);
        if (request) {
          setJoinRequest(request);
          // Pre-fill form with request data
          setFormData({
            name: request.name,
            email: request.email,
            bio: '',
            role: '',
            skills: request.skills,
            interests: request.interests,
            achievements: request.achievements,
            githubUrl: request.portfolioLinks.find(l => l.includes('github')) || '',
            linkedinUrl: request.portfolioLinks.find(l => l.includes('linkedin')) || '',
          });
        }
      }

      setLoading(false);
    }
  }, [code, inviteCodes, joinRequests]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggle = (field: keyof typeof visibility) => {
    setVisibility({
      ...visibility,
      [field]: !visibility[field],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode || !joinRequest) return;

    setSubmitting(true);
    setError('');

    try {
      // Create team profile
      const profileData: Omit<TeamProfile, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role || 'Team Member',
        bio: formData.bio,
        skills: formData.skills,
        interests: formData.interests,
        achievements: formData.achievements,
        portfolioLinks: [formData.githubUrl, formData.linkedinUrl].filter(Boolean),
        socialLinks: {
          github: formData.githubUrl || undefined,
          linkedin: formData.linkedinUrl || undefined,
        },
        visibility: {
          name: true,
          role: true,
          bio: true,
          skills: true,
          interests: true,
          achievements: true,
          portfolioLinks: true,
          socialLinks: visibility.linkedinUrl && visibility.githubUrl,
        },
        isPubliclyVisible: true,
        isApproved: true, // Already approved via join request
      };

      await createDocument<TeamProfile>('teamProfiles', profileData);

      // Mark invite code as used
      await updateDocument<InviteCode>('inviteCodes', inviteCode.id, {
        isUsed: true,
        usedBy: user.uid,
        usedAt: Timestamp.now(),
      });

      // Delete join request
      await deleteDocument('joinRequests', joinRequest.id);

      // Log audit
      await logAudit('team.approved', user.uid, {
        email: formData.email,
        name: formData.name,
        requestId: joinRequest.id,
      });

      alert('Welcome to the team! Redirecting to your dashboard...');
      router.push('/dashboard/team');
    } catch (error) {

      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !inviteCode) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-white mb-2">Invalid Invite Code</h1>
              <p className="text-gray-300 mb-6">{error}</p>
              <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" suppressHydrationWarning>
      <Navbar />
      
      <main className="flex-grow py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  🎉 Welcome to the Team!
                </h1>
                <p className="text-gray-300">
                  Complete your profile to join Saaforge. Your information from the application
                  has been pre-filled below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Role *
                  </label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g., Frontend Developer, Designer, etc."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Short Bio *
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself in a few sentences..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>GitHub URL</span>
                      <button
                        type="button"
                        onClick={() => handleToggle('githubUrl')}
                        className={`text-xs px-2 py-1 rounded ${
                          visibility.githubUrl
                            ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-700'
                            : 'bg-gray-800 text-gray-300 border border-gray-700'
                        }`}
                      >
                        {visibility.githubUrl ? '👁️ Visible' : '🔒 Hidden'}
                      </button>
                    </label>
                    <Input
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>LinkedIn URL</span>
                      <button
                        type="button"
                        onClick={() => handleToggle('linkedinUrl')}
                        className={`text-xs px-2 py-1 rounded ${
                          visibility.linkedinUrl
                            ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-700'
                            : 'bg-gray-800 text-gray-300 border border-gray-700'
                        }`}
                      >
                        {visibility.linkedinUrl ? '👁️ Visible' : '🔒 Hidden'}
                      </button>
                    </label>
                    <Input
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Email Visibility</span>
                    <button
                      type="button"
                      onClick={() => handleToggle('email')}
                      className={`text-xs px-2 py-1 rounded ${
                        visibility.email
                          ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-700'
                          : 'bg-gray-800 text-gray-300 border border-gray-700'
                      }`}
                    >
                      {visibility.email ? '👁️ Visible on profile' : '🔒 Hidden from public'}
                    </button>
                  </label>
                  <p className="text-xs text-gray-500">
                    Control whether your email is shown on your public team profile
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Pre-filled from Application:</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong className="text-blue-800">Skills:</strong>{' '}
                      <span className="text-blue-700">{formData.skills.join(', ')}</span>
                    </div>
                    <div>
                      <strong className="text-blue-800">Interests:</strong>{' '}
                      <span className="text-blue-700">{formData.interests.join(', ')}</span>
                    </div>
                    {formData.achievements.length > 0 && (
                      <div>
                        <strong className="text-blue-800">Achievements:</strong>{' '}
                        <span className="text-blue-700">{formData.achievements.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" isLoading={submitting} className="flex-1">
                    🚀 Join Team
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OnboardContent />
    </Suspense>
  );
}
