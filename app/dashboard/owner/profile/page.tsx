'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { LoadingSpinner } from '@/components/ui/Loading';

interface OwnerProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  title?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  experience: string[];
  achievements: string[];
  portfolioLinks: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
    gmail?: string;
  };
}

export default function OwnerProfilePage() {
  const { user, firebaseUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<OwnerProfile>({
    id: '',
    name: '',
    email: '',
    profilePicture: '',
    title: '',
    bio: '',
    skills: [],
    interests: [],
    experience: [],
    achievements: [],
    portfolioLinks: [],
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      website: '',
      instagram: '',
      gmail: '',
    },
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [newPortfolioLink, setNewPortfolioLink] = useState('');

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      const profileDoc = await getDoc(doc(db!, 'ownerProfiles', user.uid));
      
      if (profileDoc.exists()) {
        setProfile(profileDoc.data() as OwnerProfile);
      } else {
        // Initialize with user data
        setProfile({
          id: user.uid,
          name: firebaseUser?.displayName || '',
          email: user.email,
          profilePicture: firebaseUser?.photoURL || '',
          title: 'Owner',
          bio: '',
          skills: [],
          interests: [],
          experience: [],
          achievements: [],
          portfolioLinks: [],
          socialLinks: {
            github: '',
            linkedin: '',
            twitter: '',
            website: '',
            instagram: '',
            gmail: '',
          },
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, firebaseUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await setDoc(doc(db!, 'ownerProfiles', user.uid), {
        ...profile,
        id: user.uid,
        email: user.email,
      });
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, profilePicture: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== index) });
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setProfile({ ...profile, interests: [...profile.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setProfile({ ...profile, interests: profile.interests.filter((_, i) => i !== index) });
  };

  const addExperience = () => {
    if (newExperience.trim()) {
      setProfile({ ...profile, experience: [...profile.experience, newExperience.trim()] });
      setNewExperience('');
    }
  };

  const removeExperience = (index: number) => {
    setProfile({ ...profile, experience: profile.experience.filter((_, i) => i !== index) });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setProfile({ ...profile, achievements: [...profile.achievements, newAchievement.trim()] });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setProfile({ ...profile, achievements: profile.achievements.filter((_, i) => i !== index) });
  };

  const addPortfolioLink = () => {
    if (newPortfolioLink.trim()) {
      setProfile({ ...profile, portfolioLinks: [...profile.portfolioLinks, newPortfolioLink.trim()] });
      setNewPortfolioLink('');
    }
  };

  const removePortfolioLink = (index: number) => {
    setProfile({ ...profile, portfolioLinks: profile.portfolioLinks.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="owner">
        <DashboardLayout>
          <LoadingSpinner />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                      {profile.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'O'}
                    </div>
                  )}
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <span className="inline-block px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      📷 Upload Photo
                    </span>
                  </label>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG or GIF (max 5MB)</p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <Input
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>

                <Input
                  label="Email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />

                <Input
                  label="Title / Position"
                  value={profile.title || ''}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  placeholder="e.g., Founder & CEO"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button onClick={addSkill} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(index)}
                          className="text-gray-300 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interests
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    />
                    <Button onClick={addInterest} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm flex items-center gap-2"
                      >
                        {interest}
                        <button
                          onClick={() => removeInterest(index)}
                          className="text-gray-300 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newExperience}
                      onChange={(e) => setNewExperience(e.target.value)}
                      placeholder="Add work experience..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExperience())}
                    />
                    <Button onClick={addExperience} size="sm">Add</Button>
                  </div>
                  <div className="space-y-2">
                    {profile.experience.map((exp, index) => (
                      <Card key={index}>
                        <div className="flex items-start gap-4">
                          <div className="text-2xl">💼</div>
                          <p className="text-gray-700 flex-1">{exp}</p>
                          <button
                            onClick={() => removeExperience(index)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            ×
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Achievements
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      placeholder="Add an achievement..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                    />
                    <Button onClick={addAchievement} size="sm">Add</Button>
                  </div>
                  <div className="space-y-2">
                    {profile.achievements.map((achievement, index) => (
                      <Card key={index}>
                        <div className="flex items-start gap-4">
                          <div className="text-2xl">✓</div>
                          <p className="text-gray-700 flex-1">{achievement}</p>
                          <button
                            onClick={() => removeAchievement(index)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            ×
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
                  <div className="space-y-4">
                    <Input
                      label="GitHub"
                      value={profile.socialLinks.github || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, github: e.target.value }
                      })}
                      placeholder="https://github.com/username"
                    />
                    <Input
                      label="LinkedIn"
                      value={profile.socialLinks.linkedin || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, linkedin: e.target.value }
                      })}
                      placeholder="https://linkedin.com/in/username"
                    />
                    <Input
                      label="Twitter"
                      value={profile.socialLinks.twitter || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, twitter: e.target.value }
                      })}
                      placeholder="https://twitter.com/username"
                    />
                    <Input
                      label="Website"
                      value={profile.socialLinks.website || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, website: e.target.value }
                      })}
                      placeholder="https://yourwebsite.com"
                    />
                    <Input
                      label="Instagram"
                      value={profile.socialLinks.instagram || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/username"
                    />
                    <Input
                      label="Email (Gmail)"
                      value={profile.socialLinks.gmail || ''}
                      onChange={(e) => setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, gmail: e.target.value }
                      })}
                      placeholder="your.email@gmail.com"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} isLoading={saving} className="flex-1">
                    Save Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={loadProfile}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Card>

            {/* Google Profile Info */}
            {firebaseUser?.photoURL && (
              <Card className="mt-6 bg-gray-900 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">ℹ️</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-100">
                      Google Account Connected
                    </p>
                    <p className="text-xs text-gray-400">
                      Your profile picture is synced from your Google account. Upload a custom photo to override it.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
