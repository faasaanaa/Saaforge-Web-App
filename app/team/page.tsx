'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-black via-gray-900 to-black py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Our <span className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 bg-clip-text text-transparent">Team</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
                Meet the talented individuals who make Saaforge exceptional.
                Together, we bring ideas to life.
              </p>
              {teamMembers && teamMembers.length > 0 && (
                <p className="text-lg text-gray-200 font-semibold">
                  {teamMembers.length} talented {teamMembers.length === 1 ? 'member' : 'members'} strong
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Team Members Section */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : teamMembers && teamMembers.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => router.push(`/team-profile?id=${member.id}`)}
                    className="cursor-pointer"
                  >
                    <Card hover>
                      <div className="text-center mb-4">
                        {member.profilePicture ? (
                          <img 
                            src={member.profilePicture} 
                            alt={member.name}
                            className="w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-3 object-cover border-2 border-gray-700"
                          />
                        ) : (
                          <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl md:text-3xl font-bold border-2 border-gray-600">
                            {member.visibility.name && member.name
                              ? member.name.charAt(0).toUpperCase()
                              : '?'}
                          </div>
                        )}
                        {member.visibility.name && (
                          <h3 className="text-sm md:text-lg font-bold text-white mb-1">
                            {member.name}
                          </h3>
                        )}
                        {member.visibility.role && member.role && (
                          <p className="text-xs md:text-sm text-gray-300 font-medium mb-3">{member.role}</p>
                        )}
                      </div>

                      {member.visibility.bio && member.bio && (
                        <div className="mb-4">
                          <p className="text-[10px] md:text-sm text-gray-300 line-clamp-1">{member.bio}</p>
                        </div>
                      )}

                      {member.visibility.skills && member.skills.length > 0 && (
                        <div>
                          <h4 className="text-xs md:text-sm font-semibold text-gray-100 mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            {member.skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-800 text-gray-200 text-[9px] md:text-xs rounded-full border border-gray-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
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
      </main>

      <Footer />
    </div>
  );
}
