'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { TeamProfile } from '@/lib/types';

function TeamProfileContent() {
  const searchParams = useSearchParams();
  const rawId = searchParams?.get('id') || '';
  const id = decodeURIComponent(rawId);
  const [member, setMember] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadMember = async () => {
      try {
        if (!id) {
          setError(true);
          return;
        }
        if (!db) {
          setError(true);
          return;
        }
        const docRef = doc(db, 'teamProfiles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMember(docSnap.data() as TeamProfile);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadMember();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <EmptyState
            title="Member Not Found"
            description="This team member profile could not be found."
            icon={
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-black via-gray-900 to-black py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="text-center">
                {member.profilePicture ? (
                  <img src={member.profilePicture} alt={member.name} className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto mb-6 object-cover border-4 border-gray-700" />
                ) : (
                  <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl md:text-6xl font-bold border-4 border-gray-600">
                    {member.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                {member.visibility?.name && (
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{member.name}</h1>
                )}
                {member.visibility?.role && member.role && (
                  <p className="text-xl md:text-2xl text-gray-300 font-medium mb-4">{member.role}</p>
                )}
                {member.visibility?.bio && member.bio && (
                  <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-6">{member.bio}</p>
                )}
              </div>
            </motion.div>
          </div>
        </section>
        <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {member.visibility?.skills && member.skills && member.skills.length > 0 && (
                  <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1.5 bg-blue-900/30 text-blue-200 text-sm rounded-full border border-blue-600/50">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
                {member.visibility?.interests && member.interests && member.interests.length > 0 && (
                  <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Interests</h2>
                    <div className="flex flex-wrap gap-2">
                      {member.interests.map((interest) => (
                        <span key={interest} className="px-3 py-1.5 bg-purple-900/30 text-purple-200 text-sm rounded-full border border-purple-600/50">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
              <div className="space-y-6">
                {member.visibility?.achievements && member.achievements && member.achievements.length > 0 && (
                  <Card>
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
                {member.visibility?.portfolioLinks && member.portfolioLinks && member.portfolioLinks.length > 0 && (
                  <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Portfolio</h2>
                    <div className="space-y-2">
                      {member.portfolioLinks.map((link, idx) => (
                        <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 block truncate text-sm">
                          {link}
                        </a>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function TeamProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TeamProfileContent />
    </Suspense>
  );
}
