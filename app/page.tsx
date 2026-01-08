'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { useCollection } from '@/lib/hooks/useFirestore';
import { Project } from '@/lib/types';
import { where } from 'firebase/firestore';

export default function Home() {
  const { data: featuredProjects } = useCollection<Project>('projects', [
    where('isPublished', '==', true),
    where('isFeatured', '==', true),
  ]);

  const services = [
    {
      title: 'Automation',
      description: 'Streamline your business processes with intelligent automation solutions.',
      icon: '⚡',
    },
    {
      title: 'Web Development',
      description: 'Modern, responsive websites built with cutting-edge technologies.',
      icon: '🌐',
    },
    {
      title: 'Custom Software',
      description: 'Tailored software solutions designed specifically for your needs.',
      icon: '💻',
    },
    {
      title: 'Consulting',
      description: 'Expert guidance to help you make the right technology decisions.',
      icon: '🎯',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" suppressHydrationWarning>
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-black via-gray-900 to-black py-12 md:py-20 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Gradient Orbs */}
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -80, 0],
                y: [0, -60, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -60, 0],
                y: [0, 80, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-rose-500/10 rounded-full blur-3xl"
            />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
            
            {/* Animated Lines */}
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" suppressHydrationWarning>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
              suppressHydrationWarning
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
                  Building the Future
                </h1>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-3xl mb-6 md:mb-8 max-w-4xl mx-auto px-4 min-h-[4rem] md:min-h-[5rem] flex items-center justify-center"
              >
                <TypewriterText 
                  words={[
                    'We create premium software solutions that transform businesses.',
                    'From automation to custom development, we bring your vision to life.',
                    'Innovative technology for modern challenges.',
                    'Your partner in digital transformation.'
                  ]} 
                  className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold"
                  typingSpeed={50}
                  deletingSpeed={30}
                  pauseDuration={3000}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-row gap-4 justify-center flex-wrap"
                suppressHydrationWarning
              >
                <Link href="/owner" className="group relative inline-flex items-center justify-center rounded-2xl px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold text-white backdrop-blur-md backdrop-saturate-150 bg-white/10 border border-white/20 ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(255,255,255,0.06),0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:ring-white/25 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_40px_rgba(255,255,255,0.12),0_0_30px_rgba(255,255,255,0.15)] hover:scale-105">
                  <span className="relative z-10">Owner</span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                <Link href="/team" className="group relative inline-flex items-center justify-center rounded-2xl px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold text-white backdrop-blur-md backdrop-saturate-150 bg-white/10 border border-white/20 ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(255,255,255,0.06),0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:ring-white/25 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_40px_rgba(255,255,255,0.12),0_0_30px_rgba(255,255,255,0.15)] hover:scale-105">
                  <span className="relative z-10">Team</span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                <Link href="/projects" className="group relative inline-flex items-center justify-center rounded-2xl px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold text-white backdrop-blur-md backdrop-saturate-150 bg-white/10 border border-white/20 ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(255,255,255,0.06),0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:ring-white/25 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_40px_rgba(255,255,255,0.12),0_0_30px_rgba(255,255,255,0.15)] hover:scale-105">
                  <span className="relative z-10">Projects</span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </motion.div>
              
              {/* Floating Stats/Features */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-8 md:mt-12 grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto"
              >
                {[
                  { label: 'Projects', value: '20+' },
                  { label: 'Clients', value: '10+' },
                  { label: 'Success Rate', value: '90%' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="relative group"
                  >
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-0.5">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
              suppressHydrationWarning
            >
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">About Saaforge</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                We are a team of passionate developers and designers committed to delivering
                exceptional software solutions. Our mission is to empower businesses with
                technology that drives growth and innovation.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 md:gap-12 mb-8 md:mb-16">
              <Card>
                <h3 className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-4 text-center">Our Vision</h3>
                <p className="text-gray-300 text-xs md:text-base text-center text-justify">
                  To be the leading provider of innovative software solutions that help
                  businesses achieve their full potential through technology and automation.
                </p>
              </Card>
              <Card>
                <h3 className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-4 text-center">Our Mission</h3>
                <p className="text-gray-300 text-xs md:text-base text-center text-justify">
                  Deliver exceptional, scalable, and user-friendly software that exceeds
                  client expectations while fostering a culture of continuous learning and innovation.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
              suppressHydrationWarning
            >
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">Our Services</h2>
              <p className="text-lg text-gray-300">
                Comprehensive solutions tailored to your business needs
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card hover>
                    <div className="text-2xl md:text-4xl mb-2 md:mb-4 text-center">{service.icon}</div>
                    <h3 className="text-sm md:text-xl font-bold text-white mb-1 md:mb-2 text-center">
                      {service.title}
                    </h3>
                    <p className="text-gray-300 text-xs md:text-base text-center text-justify">{service.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        {featuredProjects && featuredProjects.length > 0 && (
          <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">Featured Projects</h2>
                <p className="text-lg text-gray-300">
                  Check out some of our recent work
                </p>
              </motion.div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {featuredProjects.slice(0, 3).map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card hover>
                      <h3 className="text-sm md:text-xl font-bold text-white mb-1 md:mb-2 text-center">
                        {project.name}
                      </h3>
                      <p className="text-gray-300 mb-2 md:mb-4 text-xs md:text-base line-clamp-2 md:line-clamp-none text-center text-justify">{project.description}</p>
                      <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-4 justify-center">
                        {project.techStack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-1.5 md:px-3 py-0.5 md:py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 text-[10px] md:text-sm rounded-full border border-gray-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <span
                        className={`inline-block px-1.5 md:px-3 py-0.5 md:py-1 text-[10px] md:text-sm rounded-full ${
                          project.status === 'completed'
                            ? 'bg-gradient-to-r from-green-900 to-green-800 text-green-300 border border-green-700'
                            : project.status === 'active'
                            ? 'bg-gradient-to-r from-blue-900 to-blue-800 text-blue-300 border border-blue-700'
                            : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 border border-gray-600'
                        }`}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12" suppressHydrationWarning>
                <Link href="/projects">
                  <Button variant="outline" size="lg">
                    View All Projects
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              suppressHydrationWarning
            >
              <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Ready to Start Your Project?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Let's work together to bring your ideas to life. Get in touch with us today.
              </p>
              <div className="flex flex-row gap-4 justify-center" suppressHydrationWarning>
                <Link href="/join" className="relative inline-flex items-center justify-center rounded-2xl px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold text-white backdrop-blur-md backdrop-saturate-150 bg-white/10 border border-white/20 ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(255,255,255,0.06),0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:ring-white/25 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_40px_rgba(255,255,255,0.12),0_0_30px_rgba(255,255,255,0.25)]">
                  Join Team
                </Link>
                <Link href="/order" className="relative inline-flex items-center justify-center rounded-2xl px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold text-white backdrop-blur-md backdrop-saturate-150 bg-white/10 border border-white/20 ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(255,255,255,0.06),0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:ring-white/25 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_40px_rgba(255,255,255,0.12),0_0_30px_rgba(255,255,255,0.25)]">
                  Request Project
                </Link>
                <Link href="/contact" className="relative inline-flex items-center justify-center rounded-2xl px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold text-white backdrop-blur-md backdrop-saturate-150 bg-white/10 border border-white/20 ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(255,255,255,0.06),0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:ring-white/25 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_40px_rgba(255,255,255,0.12),0_0_30px_rgba(255,255,255,0.25)]">
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
