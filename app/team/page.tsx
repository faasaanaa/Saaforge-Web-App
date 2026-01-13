'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
// Navbar provided by root layout
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import ProfileCard from '@/components/ui/ProfileCard';
import { useCollection } from '@/lib/hooks/useFirestore';
import { TeamProfile } from '@/lib/types';
import { where } from 'firebase/firestore';

export default function TeamPage() {
  const router = useRouter();
  const { data: allTeamMembers, loading } = useCollection<TeamProfile>('teamProfiles', [
    where('isPubliclyVisible', '==', true),
    where('isApproved', '==', true),
  ]);

  // Filter out old email-based duplicates (keep only UID-based profiles)
  const teamMembers = allTeamMembers?.filter(member => !member.id.includes('@'));

  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow relative allow-video">

        <section className="relative overflow-hidden py-16 md:py-24 min-h-[58vh] md:min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Team</h1>
              <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
                Meet the Saaforge team — creators, builders, and collaborators. Browse public
                profiles and learn more about the people behind our projects.
              </p>
            </div>
          </div>
        </section>

        {/* Team Members Section */}
        <div className="relative">
          <div className="relative z-10">
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : teamMembers && teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 justify-items-center">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="w-full max-w-xs"
                  >
                    <ProfileCard
                      avatarUrl={member.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1F2937&color=fff&size=540`}
                      miniAvatarUrl={member.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1F2937&color=fff&size=48`}
                      name={member.name}
                      title={member.role || 'Team Member'}
                      handle={member.name.toLowerCase().replace(/\s+/g, '')}
                      status="Saaforge Team"
                      contactText="View Profile"
                      onContactClick={() => router.push(`/team-profile?id=${member.id}`)}
                      behindGlowEnabled={false}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No team members yet"
                description="Check back soon to meet our team!"
                icon={
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
            )}
          </div>
        </section>
      </div>
    </div>
      </main>

      <Footer />
    </div>
  );
}
