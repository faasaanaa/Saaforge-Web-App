'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { TeamProfile } from '@/lib/types';

export default function TeamMemberPage() {
  const params = useParams();
  const rawId = params.id as string;
  // Decode the ID in case it's URL-encoded (for email-based IDs)
  const id = decodeURIComponent(rawId);
  const [member, setMember] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadMember = async () => {
      try {
        console.log('Loading team member with raw ID:', rawId);
        console.log('Decoded ID:', id);
        if (!db) {
          console.error('Firebase DB not initialized');
          setError(true);
          return;
        }
        const docRef = doc(db, 'teamProfiles', id);
        console.log('Document reference:', docRef.path);
        const docSnap = await getDoc(docRef);
        
        console.log('Document exists:', docSnap.exists());
        if (docSnap.exists()) {
          console.log('Document data:', docSnap.data());
          setMember(docSnap.data() as TeamProfile);
        } else {
          console.error('Document not found for ID:', id);
          setError(true);
        }
      } catch (err) {
        console.error('Error loading team member:', err);
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
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-black via-gray-900 to-black py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center">
                {member.profilePicture ? (
                  <img 
                    src={member.profilePicture} 
                    alt={member.name}
                    className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto mb-6 object-cover border-4 border-gray-700"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl md:text-6xl font-bold border-4 border-gray-600">
                    {member.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                
                {member.visibility?.name && (
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {member.name}
                  </h1>
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

        {/* Details Section */}
        <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Skills */}
                {member.visibility?.skills && member.skills && member.skills.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card>
                      <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1.5 bg-blue-900/30 text-blue-200 text-sm rounded-full border border-blue-600/50"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Interests */}
                {member.visibility?.interests && member.interests && member.interests.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card>
                      <h2 className="text-xl font-bold text-white mb-4">Interests</h2>
                      <div className="flex flex-wrap gap-2">
                        {member.interests.map((interest) => (
                          <span
                            key={interest}
                            className="px-3 py-1.5 bg-purple-900/30 text-purple-200 text-sm rounded-full border border-purple-600/50"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Achievements */}
                {member.visibility?.achievements && member.achievements && member.achievements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
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
                  </motion.div>
                )}

                {/* Portfolio Links */}
                {member.visibility?.portfolioLinks && member.portfolioLinks && member.portfolioLinks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <Card>
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
                  </motion.div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {member.visibility?.socialLinks && Object.keys(member.socialLinks).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <Card>
                  <h2 className="text-xl font-bold text-white mb-6">Connect</h2>
                  <div className="flex flex-wrap gap-4 md:gap-6">
                    {member.socialLinks.github && (
                      <a
                        href={member.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </a>
                    )}

                    {member.socialLinks.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.824 0-9.737h3.554v1.375c.427-.659 1.191-1.597 2.898-1.597 2.117 0 3.705 1.384 3.705 4.361v5.598zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.953.768-1.71 1.959-1.71 1.19 0 1.914.757 1.939 1.71 0 .951-.749 1.71-1.983 1.71zm1.581 11.597H3.715V9.57h3.203v10.882zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}

                    {member.socialLinks.website && (
                      <a
                        href={member.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Website
                      </a>
                    )}

                    {member.socialLinks.twitter && (
                      <a
                        href={member.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"/>
                        </svg>
                        Twitter
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
