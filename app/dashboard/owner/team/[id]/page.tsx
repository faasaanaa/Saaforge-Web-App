'use client';

import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDocument, updateDocument, deleteDocument } from '@/lib/hooks/useFirestore';
import { TeamProfile } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || null;
  const { data: member, loading } = useDocument<TeamProfile>('teamProfiles', id);
  
  const [editingRole, setEditingRole] = useState(false);
  const [roleValue, setRoleValue] = useState('');

  const handleEditRole = () => {
    setRoleValue(member?.role || '');
    setEditingRole(true);
  };

  const handleSaveRole = async () => {
    if (!id || !roleValue.trim()) {
      alert('Please enter a role');
      return;
    }
    try {
      await updateDocument<TeamProfile>('teamProfiles', id, {
        role: roleValue,
      });
      setEditingRole(false);
    } catch (err) {
      console.error('Failed to update role', err);
      alert('Failed to update role');
    }
  };

  const handleToggleApproval = async () => {
    if (!id || !member) return;
    try {
      const newApprovalStatus = !member.isApproved;
      
      // Update teamProfile approval status
      await updateDocument<TeamProfile>('teamProfiles', id, {
        isApproved: newApprovalStatus,
      });
      
      // If revoking approval, downgrade user role to 'user'
      if (!newApprovalStatus && member.userId) {
        const { doc, updateDoc, getFirestore } = await import('firebase/firestore');
        const db = getFirestore();
        await updateDoc(doc(db, 'users', member.userId), {
          role: 'user',
        });
      }
    } catch (err) {
      console.error('Failed to update approval', err);
      alert('Failed to update approval status');
    }
  };

  const handleToggleVisibility = async () => {
    if (!id || !member) return;
    try {
      await updateDocument<TeamProfile>('teamProfiles', id, {
        isPubliclyVisible: !member.isPubliclyVisible,
      });
    } catch (err) {
      console.error('Failed to update visibility', err);
      alert('Failed to update visibility');
    }
  };

  const handleDelete = async () => {
    if (!id || !member) return;
    if (!confirm(`Remove ${member.name} from team? This will revoke their approval and team access.`)) return;
    try {
      // Revoke approval instead of deleting
      await updateDocument<TeamProfile>('teamProfiles', id, {
        isApproved: false,
        isPubliclyVisible: false,
      });
      
      // Downgrade user role to 'user'
      if (member.userId) {
        const { doc, updateDoc, getFirestore } = await import('firebase/firestore');
        const db = getFirestore();
        await updateDoc(doc(db, 'users', member.userId), {
          role: 'user',
        });
      }
      
      router.push('/dashboard/owner/team');
    } catch (err) {
      console.error('Failed to remove team member', err);
      alert('Failed to remove team member');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="owner">
        <DashboardLayout>
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!member) {
    return (
      <ProtectedRoute requiredRole="owner">
        <DashboardLayout>
          <EmptyState
            title="Member Not Found"
            description="This team member profile could not be found."
            icon={
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => router.back()}
                className="text-gray-300"
              >
                ← Back
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleEditRole}
                >
                  Edit Role
                </Button>
                <Button 
                  size="sm" 
                  variant={member.isApproved ? 'outline' : 'primary'}
                  onClick={handleToggleApproval}
                >
                  {member.isApproved ? 'Revoke Approval' : 'Approve'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleToggleVisibility}
                >
                  {member.isPubliclyVisible ? 'Make Private' : 'Make Public'}
                </Button>
                <Button 
                  size="sm" 
                  variant="danger"
                  onClick={handleDelete}
                >
                  Remove from Team
                </Button>
              </div>
            </div>

            {/* Profile Header */}
            <Card className="p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {member.profilePicture ? (
                    <img 
                      src={member.profilePicture} 
                      alt={member.name}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-700"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-600">
                      {member.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-grow">
                  <div className="flex items-start gap-3 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                      {member.name || 'No Name'}
                    </h1>
                    <div className="flex gap-2">
                      {member.isApproved ? (
                        <span className="px-3 py-1 rounded-full bg-green-900/30 text-green-200 text-sm border border-green-600/50">
                          ✓ Approved
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-yellow-900/30 text-yellow-200 text-sm border border-yellow-600/50">
                          ⏳ Pending
                        </span>
                      )}
                      {member.isPubliclyVisible ? (
                        <span className="px-3 py-1 rounded-full bg-blue-900/30 text-blue-200 text-sm border border-blue-600/50">
                          🌐 Public
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-sm border border-gray-600">
                          🔒 Private
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {editingRole ? (
                    <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Edit Role</label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={roleValue}
                          onChange={(e) => setRoleValue(e.target.value)}
                          placeholder="Enter role..."
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleSaveRole}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingRole(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    member.role && (
                      <p className="text-xl text-blue-400 font-medium mb-3">{member.role}</p>
                    )
                  )}
                  
                  {member.email && (
                    <p className="text-sm text-gray-400 mb-3">📧 {member.email}</p>
                  )}
                  
                  {member.bio && (
                    <p className="text-base text-gray-300">{member.bio}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Skills */}
                {member.skills && member.skills.length > 0 && (
                  <Card className="p-5">
                    <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-blue-900/30 text-blue-200 text-sm rounded-full border border-blue-600/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Interests */}
                {member.interests && member.interests.length > 0 && (
                  <Card className="p-5">
                    <h2 className="text-xl font-bold text-white mb-4">Interests</h2>
                    <div className="flex flex-wrap gap-2">
                      {member.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-purple-900/30 text-purple-200 text-sm rounded-full border border-purple-600/50"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Achievements */}
                {member.achievements && member.achievements.length > 0 && (
                  <Card className="p-5">
                    <h2 className="text-xl font-bold text-white mb-4">Achievements</h2>
                    <ul className="space-y-2">
                      {member.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-gray-300 flex items-start">
                          <span className="mr-3 text-green-400 font-bold">✓</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Portfolio Links */}
                {member.portfolioLinks && member.portfolioLinks.length > 0 && (
                  <Card className="p-5">
                    <h2 className="text-xl font-bold text-white mb-4">Portfolio</h2>
                    <div className="space-y-2">
                      {member.portfolioLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 block truncate text-sm"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Social Links */}
            {member.socialLinks && Object.keys(member.socialLinks).some(key => member.socialLinks?.[key as keyof typeof member.socialLinks]) && (
              <Card className="p-5 mt-6">
                <h2 className="text-xl font-bold text-white mb-4">Social Links</h2>
                <div className="flex flex-wrap gap-4">
                  {member.socialLinks.github && (
                    <a
                      href={member.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {member.socialLinks.linkedin && (
                    <a
                      href={member.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {member.socialLinks.twitter && (
                    <a
                      href={member.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Twitter
                    </a>
                  )}
                  {member.socialLinks.website && (
                    <a
                      href={member.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Website
                    </a>
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
