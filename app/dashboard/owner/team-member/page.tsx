'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useDocument, updateDocument, deleteDocument } from '@/lib/hooks/useFirestore';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  skills?: string[];
  profilePicture?: string;
  isApproved: boolean;
}

function TeamMemberDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const memberId = searchParams?.get('id');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: member, loading, error } = useDocument<TeamMember>(
    'teamProfiles',
    memberId
  );

  if (!memberId) {
    return (
      <EmptyState
        title="No team member selected"
        description="Select a team member from the team list"
        icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
    );
  }

  if (loading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  if (error || !member) {
    return (
      <EmptyState
        title="Team member not found"
        description="The team member you're looking for doesn't exist"
        icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2" /></svg>}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
      >
        ← Back to Team
      </button>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {!member.isApproved ? (
          <button
            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-500 disabled:opacity-60"
            disabled={saving}
            onClick={async () => {
              if (!memberId) return;
              setSaving(true);
              try {
                await updateDocument<TeamMember>('teamProfiles', memberId, { isApproved: true });
              } finally {
                setSaving(false);
              }
            }}
          >
            Approve
          </button>
        ) : (
          <button
            className="px-4 py-2 rounded-lg bg-yellow-700 text-white text-sm font-semibold hover:bg-yellow-600 disabled:opacity-60"
            disabled={saving}
            onClick={async () => {
              if (!memberId) return;
              setSaving(true);
              try {
                await updateDocument<TeamMember>('teamProfiles', memberId, { isApproved: false });
              } finally {
                setSaving(false);
              }
            }}
          >
            Mark Pending
          </button>
        )}

        <button
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-100 text-sm font-semibold border border-gray-700 hover:bg-gray-700 disabled:opacity-60"
          disabled={saving}
          onClick={async () => {
            if (!memberId) return;
            const role = prompt('Enter role for this member:', member.role || 'Member');
            if (!role) return;
            setSaving(true);
            try {
              await updateDocument<TeamMember>('teamProfiles', memberId, { role });
            } finally {
              setSaving(false);
            }
          }}
        >
          Set Role
        </button>

        <button
          className="px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60"
          disabled={deleting}
          onClick={async () => {
            if (!memberId) return;
            const confirmDelete = window.confirm('Delete this team member? This cannot be undone.');
            if (!confirmDelete) return;
            setDeleting(true);
            try {
              await deleteDocument('teamProfiles', memberId);
              router.back();
            } finally {
              setDeleting(false);
            }
          }}
        >
          Delete
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
        <div className="flex gap-6 mb-6">
          {member.profilePicture ? (
            <img 
              src={member.profilePicture} 
              alt={member.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-blue-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
              {member.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}

          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-white mb-2">{member.name}</h1>
            <p className="text-gray-300 mb-4">{member.email}</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 text-sm rounded-full bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
                {member.role || 'Member'}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full border ${
                member.isApproved
                  ? 'bg-green-900/50 text-green-300 border-green-700/50'
                  : 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50'
              }`}>
                {member.isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {member.bio && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Bio</h2>
            <p className="text-gray-300">{member.bio}</p>
          </div>
        )}

        {member.skills && member.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {member.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamMemberDetailPage() {
  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <TeamMemberDetailContent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
