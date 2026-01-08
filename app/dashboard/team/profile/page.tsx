'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useDocument } from '@/lib/hooks/useFirestore';
import { TeamProfile } from '@/lib/types';
import { doc, setDoc, getDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const SKILL_SUGGESTIONS = [
  'Python', 'PyTorch', 'Pandas', 'JavaScript', 'TypeScript', 'React', 'React Native',
  'Node.js', 'Next.js', 'Vue.js', 'Angular', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'Flutter', 'Django', 'Flask', 'FastAPI',
  'Express.js', 'Spring Boot', 'ASP.NET', 'Docker', 'Kubernetes', 'AWS',
  'Azure', 'Google Cloud', 'Firebase', 'MongoDB', 'PostgreSQL', 'MySQL',
  'Redis', 'GraphQL', 'REST API', 'Git', 'CI/CD', 'TensorFlow', 'Scikit-learn',
  'Machine Learning', 'Deep Learning', 'Data Science', 'DevOps', 'Blockchain',
  'Solidity', 'Web3.js', 'Figma', 'Adobe XD', 'UI/UX Design', 'Tailwind CSS',
  'Bootstrap', 'Material-UI', 'Sass', 'Linux', 'Bash', 'PowerShell'
];

const INTEREST_SUGGESTIONS = [
  'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Computer Vision',
  'Natural Language Processing', 'Web Development', 'Mobile Development',
  'Game Development', 'Cloud Computing', 'DevOps', 'Cybersecurity',
  'Blockchain', 'Web3', 'Cryptocurrency', 'Data Science', 'Data Analytics',
  'Big Data', 'IoT', 'Robotics', 'Augmented Reality', 'Virtual Reality',
  'UI/UX Design', 'Product Design', 'Frontend Development', 'Backend Development',
  'Full Stack Development', 'Database Management', 'System Architecture',
  'Microservices', 'Serverless', 'API Development', 'Testing & QA',
  'Agile Methodologies', 'Open Source', 'Technical Writing'
];

export default function TeamProfilePage() {
  const { user } = useAuth();
  const { data: profile, loading } = useDocument<TeamProfile>(
    'teamProfiles',
    user?.uid || null
  );
  const [loadedProfile, setLoadedProfile] = useState<TeamProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    achievements: '',
    portfolioLinks: '',
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [profilePicture, setProfilePicture] = useState<string>('');

  const [visibility, setVisibility] = useState({
    name: true,
    role: true,
    bio: true,
    skills: true,
    interests: false,
    achievements: false,
    portfolioLinks: false,
    socialLinks: false,
  });

  const [isPubliclyVisible, setIsPubliclyVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load profile from UID or email (for migration support)
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid || !db) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        
        // First try to load by UID
        if (profile) {
          setLoadedProfile(profile);
          setIsLoadingProfile(false);
          return;
        }

        // If not found by UID, try by email
        if (user.email) {
          const emailProfileRef = doc(db, 'teamProfiles', user.email);
          const emailProfileDoc = await getDoc(emailProfileRef);
          
          if (emailProfileDoc.exists()) {
            const emailProfile = { id: emailProfileDoc.id, ...emailProfileDoc.data() } as TeamProfile;
            setLoadedProfile(emailProfile);
            
            // Migrate to UID if not already migrated
            const uidProfileRef = doc(db, 'teamProfiles', user.uid);
            const uidProfileDoc = await getDoc(uidProfileRef);
            if (!uidProfileDoc.exists()) {
              await setDoc(uidProfileRef, {
                ...emailProfile,
                userId: user.uid,
                updatedAt: Timestamp.now(),
              });
              // Delete old email-based profile
              await deleteDoc(emailProfileRef);
            }
          }
        }
        
        setIsLoadingProfile(false);
      } catch (error) {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user?.uid, user?.email, profile]);

  useEffect(() => {
    const profileToUse = loadedProfile || profile;
    if (profileToUse) {
      // Auto-populate form data from the profile (which was created from join request)
      setFormData({
        name: profileToUse.name || '',
        role: profileToUse.role || '',
        bio: profileToUse.bio || '',
        achievements: profileToUse.achievements?.join('\n') || '',
        portfolioLinks: profileToUse.portfolioLinks?.join('\n') || '',
        github: profileToUse.socialLinks?.github || '',
        linkedin: profileToUse.socialLinks?.linkedin || '',
        twitter: profileToUse.socialLinks?.twitter || '',
        website: profileToUse.socialLinks?.website || '',
      });
      setSkills(profileToUse.skills || []);
      setInterests(profileToUse.interests || []);
      setProfilePicture(profileToUse.profilePicture || '');
      
      // Only update visibility if it exists in the profile, otherwise keep defaults
      if (profileToUse.visibility) {
        setVisibility(profileToUse.visibility);
      }
      
      // Set public visibility status
      if (typeof profileToUse.isPubliclyVisible !== 'undefined') {
        setIsPubliclyVisible(profileToUse.isPubliclyVisible);
      }
    }
  }, [loadedProfile, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVisibilityChange = (field: keyof typeof visibility) => {
    setVisibility({
      ...visibility,
      [field]: !visibility[field],
    });
  };

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 3MB for base64 storage)
    if (file.size > 3 * 1024 * 1024) {
      alert('Image size must be less than 3MB. Please compress your image.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePicture(base64String);
      };
      reader.onerror = () => {
        alert('Failed to upload picture. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Failed to upload picture. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // Build socialLinks object with only non-empty values
      const socialLinks: any = {};
      if (formData.github?.trim()) socialLinks.github = formData.github.trim();
      if (formData.linkedin?.trim()) socialLinks.linkedin = formData.linkedin.trim();
      if (formData.twitter?.trim()) socialLinks.twitter = formData.twitter.trim();
      if (formData.website?.trim()) socialLinks.website = formData.website.trim();

      const profileToUpdate = loadedProfile || profile;
      
      // Ensure we have createdAt and isApproved from existing profile
      const createdAt = profileToUpdate?.createdAt || Timestamp.now();
      const isApproved = profileToUpdate?.isApproved ?? true; // Preserve approval status

      // Save profile using setDoc with merge to preserve all fields
      const updateData: any = {
        userId: user.uid,
        email: user.email,
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        skills: skills,
        interests: interests,
        achievements: formData.achievements.split('\n').filter((s) => s.trim()),
        portfolioLinks: formData.portfolioLinks.split('\n').filter((s) => s.trim()),
        socialLinks,
        visibility,
        isPubliclyVisible,
        isApproved, // Preserve approval status
        createdAt,
        updatedAt: Timestamp.now(),
      };

      // Only include profilePicture if it has a value
      if (profilePicture) {
        updateData.profilePicture = profilePicture;
      }

      await setDoc(
        doc(db!, 'teamProfiles', user.uid),
        updateData,
        { merge: true }
      );

      // Delete email-based profile if it exists (prevent duplicate cards)
      if (user.email) {
        try {
          const emailProfileRef = doc(db!, 'teamProfiles', user.email);
          const emailProfileDoc = await getDoc(emailProfileRef);
          if (emailProfileDoc.exists()) {
            await deleteDoc(emailProfileRef);
          }
        } catch (error) {
          // Cleanup error - silent fail
        }
      }

      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || isLoadingProfile) {
    return (
      <ProtectedRoute requiredRole="team" requireTeamApproval>
        <DashboardLayout>
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="team" requireTeamApproval>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >


            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Profile Picture</h2>
                <div className="flex items-center gap-6">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePicture"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      {profilePicture ? 'Change Picture' : 'Upload Picture'}
                    </label>
                    <p className="text-sm text-gray-600 mt-2">
                      Recommended: Square image, max 2MB
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibility.name}
                          onChange={() => handleVisibilityChange('name')}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Public</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <Input
                        label="Role/Title"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="Full Stack Developer"
                      />
                    </div>
                    <div className="pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibility.role}
                          onChange={() => handleVisibilityChange('role')}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Public</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <Textarea
                        label="Bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibility.bio}
                          onChange={() => handleVisibilityChange('bio')}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Public</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Skills & Interests</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <AutocompleteInput
                        label="Skills"
                        value={skills}
                        onChange={setSkills}
                        suggestions={SKILL_SUGGESTIONS}
                        placeholder="Type to search skills..."
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {skills.length} skill{skills.length !== 1 ? 's' : ''} added
                      </p>
                    </div>
                    <div className="pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibility.skills}
                          onChange={() => handleVisibilityChange('skills')}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Public</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <AutocompleteInput
                        label="Interests"
                        value={interests}
                        onChange={setInterests}
                        suggestions={INTEREST_SUGGESTIONS}
                        placeholder="Type to search interests..."
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {interests.length} interest{interests.length !== 1 ? 's' : ''} added
                      </p>
                    </div>
                    <div className="pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibility.interests}
                          onChange={() => handleVisibilityChange('interests')}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Public</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <Textarea
                        label="Achievements"
                        name="achievements"
                        value={formData.achievements}
                        onChange={handleChange}
                        rows={4}
                        placeholder="List your achievements (one per line)"
                      />
                    </div>
                    <div className="pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibility.achievements}
                          onChange={() => handleVisibilityChange('achievements')}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Public</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Links & Social</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <Textarea
                        label="Portfolio Links"
                        name="portfolioLinks"
                        value={formData.portfolioLinks}
                        onChange={handleChange}
                        rows={3}
                        placeholder="https://example.com (one per line)"
                      />
                    </div>
                    <div className="pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibility.portfolioLinks}
                          onChange={() => handleVisibilityChange('portfolioLinks')}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Public</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Social Links</h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibility.socialLinks}
                          onChange={() => handleVisibilityChange('socialLinks')}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Show social links publicly</span>
                      </label>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="GitHub"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                      />
                      <Input
                        label="LinkedIn"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                      <Input
                        label="Twitter"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        placeholder="https://twitter.com/username"
                      />
                      <Input
                        label="Website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-white mb-4">Profile Visibility</h2>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <input
                    type="checkbox"
                    checked={isPubliclyVisible}
                    onChange={(e) => setIsPubliclyVisible(e.target.checked)}
                    className="rounded w-5 h-5"
                  />
                  <div>
                    <p className="font-medium text-gray-100">
                      Make my profile visible on the public team page
                    </p>
                    <p className="text-sm text-gray-400">
                      Only the fields you've marked as "Public" will be shown
                    </p>
                  </div>
                </label>
              </Card>

              <div className="flex gap-4">
                <Button type="submit" size="lg" isLoading={saving} className="flex-1">
                  Save Profile
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
