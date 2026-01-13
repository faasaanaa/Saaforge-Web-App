'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// Navbar provided by root layout
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { CardCarousel } from '@/components/ui/CardCarousel';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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

export default function OwnerPage() {
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOwnerProfile();
  }, []);

  const loadOwnerProfile = async () => {
    try {
      const querySnapshot = await getDocs(collection(db!, 'ownerProfiles'));
      if (!querySnapshot.empty) {
        const profileData = querySnapshot.docs[0].data() as OwnerProfile;
        setOwnerProfile(profileData);
      }
    } catch (error) {
      // Profile load error - silent fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow relative allow-video">

        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 min-h-[58vh] md:min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {ownerProfile?.profilePicture ? (
                <img
                  src={ownerProfile.profilePicture}
                  alt={ownerProfile.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-gray-700 shadow-lg shadow-gray-900/50"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-700 shadow-lg shadow-gray-900/50">
                  {ownerProfile?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {ownerProfile?.name || 'Meet the Founder'}
              </h1>
              <div className="text-xl text-gray-300 mb-6 min-h-[2rem] flex items-center justify-center">
                <TypewriterText words={['Owner', 'Founder']} className="text-xl text-gray-300" />
              </div>
              <div className="flex gap-4 justify-center">
                {ownerProfile?.socialLinks?.github && (
                  <a
                    href={ownerProfile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-2xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg shadow-gray-900/50 border border-gray-600"
                    aria-label="GitHub"
                  >
                    💻
                  </a>
                )}
                {ownerProfile?.socialLinks?.linkedin && (
                  <a
                    href={ownerProfile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-2xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg shadow-gray-900/50 border border-gray-600"
                    aria-label="LinkedIn"
                  >
                    💼
                  </a>
                )}
                {ownerProfile?.socialLinks?.twitter && (
                  <a
                    href={ownerProfile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-2xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg shadow-gray-900/50 border border-gray-600"
                    aria-label="Twitter"
                  >
                    🐦
                  </a>
                )}
                {ownerProfile?.socialLinks?.instagram && (
                  <a
                    href={ownerProfile.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg shadow-gray-900/50 border border-gray-600"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="url(#instagram-gradient)" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#FD5949' }} />
                          <stop offset="50%" style={{ stopColor: '#D6249F' }} />
                          <stop offset="100%" style={{ stopColor: '#285AEB' }} />
                        </linearGradient>
                      </defs>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {ownerProfile?.socialLinks?.gmail && (
                  <a
                    href={`mailto:${ownerProfile.socialLinks.gmail}`}
                    className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-2xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg shadow-gray-900/50 border border-gray-600"
                    aria-label="Email"
                  >
                    📧
                  </a>
                )}
                {ownerProfile?.socialLinks?.website && (
                  <a
                    href={ownerProfile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-2xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg shadow-gray-900/50 border border-gray-600"
                    aria-label="Website"
                  >
                    🌐
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <div className="relative">
          <div className="relative z-10">
        <section className="py-20 bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-4 sm:p-5 md:p-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">About Me</h2>
                <Card className="bg-gray-900/50 border border-gray-800 p-4 sm:p-5">
                  {ownerProfile?.bio ? (
                    <p className="whitespace-pre-wrap text-gray-300 text-xs leading-relaxed text-justify break-words">{ownerProfile.bio}</p>
                  ) : (
                    <CardCarousel
                      cards={[
                        {
                          paragraphs: [
                            "I'm the founder of Saaforge, a passionate developer and entrepreneur dedicated to building innovative software solutions that make a real difference.",
                            "At Saaforge, we combine technical excellence with creative problem-solving to deliver solutions that exceed expectations.",
                          ],
                        },
                        {
                          paragraphs: [
                            "With much of experience in software development, I've worked across the full stack, from frontend interfaces to backend systems and cloud infrastructure. My mission is to help businesses leverage technology to achieve their goals. And build interactive and helpful apps and automations.",
                          ],
                        },
                      ]}
                      displayDuration={5000}
                      transitionDuration={0.6}
                    />
                  )}
                </Card>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-20 bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
                Skills & Expertise
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                {(ownerProfile?.skills && ownerProfile.skills.length > 0 ? ownerProfile.skills : [
                  'Full-Stack Development',
                  'Node.JS',
                  'DevOps & CI/CD',
                  'Product Management',
                  'Team Leadership',
                  'System Design',
                ]).map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-3 sm:p-4">
                      <p className="text-center font-medium text-white text-xs md:text-base">{skill}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="py-20 bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
                Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-2 md:gap-4">
                {(ownerProfile?.achievements && ownerProfile.achievements.length > 0 ? ownerProfile.achievements : [
                  'Founder and Owner of SAAFORGE.PVT.LTD',
                  'Built and scaled multiple SaaS products',
                  'Worked in AI and automation systems',
                  'Built and scaled multiple websites',
                  'Successfully delivered 10+ client projects',
                ]).map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-4 sm:p-5">
                      <div className="flex items-start gap-2 md:gap-4">
                        <div className="text-lg md:text-2xl text-gray-300">✓</div>
                        <p className="text-gray-300 flex-1 text-xs md:text-base">{achievement}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Experience Section */}
        {ownerProfile?.experience && ownerProfile.experience.length > 0 && (
          <section className="py-20 bg-transparent">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
                  Experience
                </h2>
                <div className="space-y-4">
                  {ownerProfile.experience.map((exp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="p-4 sm:p-5">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="text-xl md:text-2xl">💼</div>
                          <p className="text-gray-300 flex-1 text-sm md:text-base">{exp}</p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Portfolio Links Section */}
        {ownerProfile?.portfolioLinks && ownerProfile.portfolioLinks.length > 0 && (
          <section className="py-20 bg-transparent">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
                  Portfolio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ownerProfile.portfolioLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="hover:shadow-lg transition-shadow p-4 sm:p-5">
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-gray-300 hover:text-gray-100"
                        >
                          <div className="text-xl md:text-2xl">🔗</div>
                          <span className="flex-1 truncate">{link}</span>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Social Handles Section */}
        {ownerProfile?.socialLinks && Object.values(ownerProfile.socialLinks).some(link => link) && (
          <section className="py-20 bg-transparent">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
                  Connect With Me
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {ownerProfile.socialLinks.github && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Card className="hover:shadow-lg transition-shadow overflow-hidden p-4 sm:p-5">
                        <a
                          href={ownerProfile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-300 hover:text-white w-full"
                      >
                        <div className="text-xl md:text-4xl flex-shrink-0">💻</div>
                        <div className="flex-1 min-w-0 text-center md:text-left">
                          <p className="font-semibold truncate text-xs md:text-base">GitHub</p>
                          <p className="text-[10px] md:text-sm text-gray-300 truncate hidden md:block">{ownerProfile.socialLinks.github.replace('https://', '')}</p>
                          </div>
                        </a>
                      </Card>
                    </motion.div>
                  )}
                  {ownerProfile.socialLinks.linkedin && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="hover:shadow-lg transition-shadow overflow-hidden p-4 sm:p-5">
                        <a
                          href={ownerProfile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-blue-600 hover:text-blue-700 w-full"
                      >
                        <div className="text-xl md:text-4xl flex-shrink-0">💼</div>
                        <div className="flex-1 min-w-0 text-center md:text-left">
                          <p className="font-semibold truncate text-xs md:text-base">LinkedIn</p>
                          <p className="text-[10px] md:text-sm text-gray-300 truncate hidden md:block">{ownerProfile.socialLinks.linkedin.replace('https://', '')}</p>
                          </div>
                        </a>
                      </Card>
                    </motion.div>
                  )}
                  {ownerProfile.socialLinks.twitter && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Card className="hover:shadow-lg transition-shadow overflow-hidden p-4 sm:p-5">
                        <a
                          href={ownerProfile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-blue-600 hover:text-blue-700 w-full"
                      >
                        <div className="text-xl md:text-4xl flex-shrink-0">🐦</div>
                        <div className="flex-1 min-w-0 text-center md:text-left">
                          <p className="font-semibold truncate text-xs md:text-base">Twitter</p>
                          <p className="text-[10px] md:text-sm text-gray-300 truncate hidden md:block">{ownerProfile.socialLinks.twitter.replace('https://', '')}</p>
                          </div>
                        </a>
                      </Card>
                    </motion.div>
                  )}
                  {ownerProfile.socialLinks.instagram && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Card className="hover:shadow-lg transition-shadow overflow-hidden p-4 sm:p-5">
                        <a
                          href={ownerProfile.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                        className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-blue-600 hover:text-blue-700 w-full"
                      >
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 md:w-10 md:h-10" fill="url(#instagram-gradient-2)" viewBox="0 0 24 24">
                              <defs>
                                <linearGradient id="instagram-gradient-2" x1="0%" y1="100%" x2="100%" y2="0%">
                                  <stop offset="0%" style={{ stopColor: '#FD5949' }} />
                                  <stop offset="50%" style={{ stopColor: '#D6249F' }} />
                                  <stop offset="100%" style={{ stopColor: '#285AEB' }} />
                                </linearGradient>
                              </defs>
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0 text-center md:text-left">
                            <p className="font-semibold truncate text-xs md:text-base">Instagram</p>
                            <p className="text-[10px] md:text-sm text-gray-300 truncate hidden md:block">{ownerProfile.socialLinks.instagram.replace('https://', '')}</p>
                          </div>
                        </a>
                      </Card>
                    </motion.div>
                  )}
                  {ownerProfile.socialLinks.gmail && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Card className="hover:shadow-lg transition-shadow overflow-hidden p-4 sm:p-5">
                        <a
                          href={`mailto:${ownerProfile.socialLinks.gmail}`}
                        className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-blue-600 hover:text-blue-700 w-full"
                      >
                        <div className="text-xl md:text-4xl flex-shrink-0">📧</div>
                        <div className="flex-1 min-w-0 text-center md:text-left">
                          <p className="font-semibold truncate text-xs md:text-base">Email</p>
                          <p className="text-[10px] md:text-sm text-gray-300 truncate hidden md:block">{ownerProfile.socialLinks.gmail}</p>
                          </div>
                        </a>
                      </Card>
                    </motion.div>
                  )}
                  {ownerProfile.socialLinks.website && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <Card className="hover:shadow-lg transition-shadow overflow-hidden p-4 sm:p-5">
                        <a
                          href={ownerProfile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-blue-600 hover:text-blue-700 w-full"
                      >
                        <div className="text-xl md:text-4xl flex-shrink-0">🌐</div>
                        <div className="flex-1 min-w-0 text-center md:text-left">
                          <p className="font-semibold truncate text-xs md:text-base">Website</p>
                          <p className="text-[10px] md:text-sm text-gray-300 truncate hidden md:block">{ownerProfile.socialLinks.website.replace('https://', '')}</p>
                          </div>
                        </a>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/*                 stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Interests Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-4 sm:p-5 md:p-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Interests</h2>
                <div className="flex flex-wrap gap-1.5 md:gap-3">
                  {(ownerProfile?.interests && ownerProfile.interests.length > 0 ? ownerProfile.interests : [
                    'Emerging Technologies',
                    'AI/ML',
                    'Open Source',
                    'Cloud Computing',
                    'Cyber Security',
                    'Mentoring',
                    'Tech Community',
                    'Innovation',
                  ]).map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-blue-300 rounded-full text-[10px] md:text-sm font-medium border border-blue-700"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
      </main>

      <Footer />
    </div>
  );
}
