"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion } from "framer-motion";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TypewriterText } from "@/components/ui/TypewriterText";
import CardSwap, { Card as SwapCard } from "@/components/ui/CardSwap";
import LogoLoop from '@/components/ui/LogoLoop';
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiGithub,
  SiDocker,
  SiAmazon,
  SiVscodium,
} from 'react-icons/si';
import { useCollection } from "@/lib/hooks/useFirestore";
import { Project } from "@/lib/types";
import { where } from "firebase/firestore";

export default function Home() {
  const { data: featuredProjects } = useCollection<Project>("projects", [
    where("isPublished", "==", true),
    where("isFeatured", "==", true),
  ]);

  const services = [
    {
      title: "Automation",
      description: "Streamline your business processes with intelligent automation solutions.",
      icon: "⚡",
    },
    {
      title: "Web Development",
      description: "Modern, responsive websites built with cutting-edge technologies.",
      icon: "🌐",
    },
    {
      title: "Custom Software",
      description: "Tailored software solutions designed specifically for your needs.",
      icon: "💻",
    },
    {
      title: "Consulting",
      description: "Expert guidance to help you make the right technology decisions.",
      icon: "🎯",
    },
  ];

  const techLogos = [
    { node: <SiReact />, title: 'React', href: 'https://react.dev' },
    { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
    { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org' },
    { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
    { node: <SiGithub />, title: 'GitHub', href: 'https://github.com' },
    { node: <SiDocker />, title: 'Docker', href: 'https://www.docker.com' },
    { node: <SiAmazon />, title: 'AWS', href: 'https://aws.amazon.com' },
    { node: <SiVscodium />, title: 'VSCodium', href: 'https://vscodium.com' },
  ];

  return (
    <div className="min-h-screen flex flex-col" suppressHydrationWarning>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-black min-h-screen md:py-20 py-12 relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <video
              src="/hero_bg.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-start pt-14 md:pt-6" suppressHydrationWarning>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full text-center"
              suppressHydrationWarning
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 md:mb-2 leading-tight">
                  Shaphing the Future
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-3xl mb-4 md:mb-1 max-w-4xl mx-auto px-4 pt-4 md:pt-2 min-h-[4rem] md:min-h-[6rem] flex flex-col items-center"
              >
                <TypewriterText
                  words={[
                    "We create premium software solutions that transform businesses.",
                    "From automation to custom development, we bring your vision to life.",
                    "Innovative technology for modern challenges.",
                    "Your partner in digital transformation."
                  ]}
                  className="bg-gradient-to-r from-white/80 via-gray-300 to-white/60 bg-clip-text text-transparent font-semibold text-center"
                  typingSpeed={50}
                  deletingSpeed={30}
                  pauseDuration={3000}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-full mt-10 md:mt-3"
                suppressHydrationWarning
              >
                {/* Mobile: two buttons on top row, one below. Desktop: inline */}
                <div className="block md:hidden w-full">
                  <div className="max-w-xs mx-auto w-full">
                    <div className="grid grid-cols-2 gap-4">
                      <Link
                        href="/owner"
                        className="col-span-1 flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-white/5 border border-white/20 crystal"
                      >
                        Owner
                      </Link>
                      <Link
                        href="/team"
                        className="col-span-1 flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-white/5 border border-white/20"
                      >
                        Team
                      </Link>
                      <Link
                        href="/projects"
                        className="col-span-2 mt-2 flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-white/5 border border-white/20 crystal"
                      >
                        Projects
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex gap-4 justify-center">
                  <Link href="/owner" className="px-6 py-3 rounded-2xl bg-white text-black font-semibold shadow-lg hover:shadow-xl transition-all">
                    Owner
                  </Link>
                  <Link href="/team" className="px-6 py-3 rounded-2xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all">
                    Team
                  </Link>
                  <Link href="/projects" className="px-6 py-3 rounded-2xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all">
                    Projects
                  </Link>
                </div>
                  {/* Mobile-only showcase metrics (two in a row, one below) */}
                  <div className="block md:hidden mt-10">
                    <div className="max-w-xs mx-auto w-full">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="crystal-glass rounded-2xl p-3 text-center showcase-card flex flex-col items-center justify-center">
                          <div className="relative z-10">
                            <div className="text-xl font-extrabold text-white">10+</div>
                            <div className="text-sm text-gray-300 mt-1">Clients</div>
                          </div>
                        </div>

                        <div className="crystal-glass rounded-2xl p-3 text-center showcase-card flex flex-col items-center justify-center">
                          <div className="relative z-10">
                            <div className="text-xl font-extrabold text-white">15+</div>
                            <div className="text-sm text-gray-300 mt-1">Projects Delivered</div>
                          </div>
                        </div>

                        <div className="col-span-2 crystal-glass rounded-2xl p-3 text-center showcase-card flex flex-col items-center justify-center">
                          <div className="relative z-10">
                            <div className="text-xl font-extrabold text-white">90%</div>
                            <div className="text-sm text-gray-300 mt-1">Success Rate</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Galaxy removed from landing background */}
        {/* Showcase Metrics - clients / projects / success (mobile copy shown inside hero; hide original on mobile) */}
        <section className="py-8 bg-transparent hidden md:block -mt-28 md:-mt-48 relative z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
              <div className="crystal-glass rounded-2xl p-3 sm:p-4 text-center showcase-card w-[200px] md:w-[220px] min-h-[140px] md:min-h-[160px] flex flex-col items-center justify-center">
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">10+</div>
                  <div className="text-sm sm:text-base text-gray-300 mt-1">Clients</div>
                </div>
              </div>

              <div className="crystal-glass rounded-2xl p-3 sm:p-4 text-center showcase-card w-[200px] md:w-[220px] min-h-[140px] md:min-h-[160px] flex flex-col items-center justify-center">
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">15+</div>
                  <div className="text-sm sm:text-base text-gray-300 mt-1">Projects Delivered</div>
                </div>
              </div>

              <div className="crystal-glass rounded-2xl p-3 sm:p-4 text-center showcase-card w-[200px] md:w-[220px] min-h-[140px] md:min-h-[160px] flex flex-col items-center justify-center">
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">90%</div>
                  <div className="text-sm sm:text-base text-gray-300 mt-1">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Loop removed and will be rendered below About section cards */}

        {/* About Section with sliding panels and centered text */}
        <section className="pt-12 pb-6 md:py-12 bg-transparent relative overflow-hidden">
          {/* Full-bleed AboutSection (panels must reach window edges) */}
          <AboutSection />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" suppressHydrationWarning>
            {/* reserved inner container if further content is needed */}
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 bg-transparent relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pl-8 lg:pr-0" suppressHydrationWarning>
            {/* Main Content Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
              {/* Left Side - Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6 h-full flex flex-col justify-start lg:justify-end mb-8 lg:mb-40 mt-16 md:mt-0"
              >
                <div>
                  <h2 className="text-2xl md:text-6xl font-bold text-white mb-3 leading-tight text-left md:text-center mt-8 md:-mt-6">We make what your<br className="block md:hidden" /> heart desires</h2>
                  <p className="text-sm md:text-lg text-gray-400 text-left md:text-center mt-2 md:mt-4">Our provided services!</p>
                </div>
              </motion.div>

              {/* Right Side - Card Stack */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative h-[350px] md:h-[600px] w-full flex items-start justify-start md:justify-end overflow-visible -translate-x-56 md:translate-x-0 lg:translate-x-16"
              >
                <div className="w-full md:w-auto px-4 md:px-0">
                  {/* Mobile CardSwap */}
                  <div className="block md:hidden -mt-6 md:mt-0">
                    <CardSwap
                      width={420}
                      height={240}
                      cardDistance={50}
                      verticalDistance={50}
                      delay={5000}
                      pauseOnHover={false}
                      skewAmount={4}
                      easing="elastic"
                    >
                      {services.map((service, index) => (
                        <SwapCard key={service.title}>
                          <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/20 shadow-2xl border border-white/10">
                            {/* Background Texture (subtle so Galaxy shows) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                            <div className="absolute inset-0 backdrop-blur-[2px]" />
                            
                            {/* Glowing Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
                            
                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col items-start justify-center p-4 text-left md:items-center md:text-center">
                              {/* Large Number */}
                              <div className="text-5xl font-bold text-white/90 mb-2 drop-shadow-lg">
                                {index + 1}
                              </div>
                              
                              {/* Icon */}
                              <div className="text-3xl mb-2 drop-shadow-lg">
                                {service.icon}
                              </div>
                              
                              {/* Title */}
                              <h3 className="text-base font-bold text-white mb-2 drop-shadow-lg text-left md:text-center">
                                {service.title}
                              </h3>
                              
                              {/* Description */}
                              <p className="text-[11px] text-white/80 leading-snug drop-shadow-md px-2 text-left md:text-center">
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </SwapCard>
                      ))}
                    </CardSwap>
                  </div>
                  
                  {/* Desktop CardSwap */}
                  <div className="hidden md:block -mt-8 md:mt-0">
                    <CardSwap
                      width={600}
                      height={450}
                      cardDistance={60}
                      verticalDistance={70}
                      delay={5000}
                      pauseOnHover={false}
                      skewAmount={6}
                      easing="elastic"
                    >
                    {services.map((service, index) => (
                      <SwapCard key={service.title}>
                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/20 shadow-2xl border border-white/10">
                          {/* Background Texture (subtle so Galaxy shows) */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                          <div className="absolute inset-0 backdrop-blur-[2px]" />
                          
                          {/* Glowing Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
                          
                          {/* Content */}
                          <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:p-8 text-center">
                            {/* Large Number */}
                            <div className="text-6xl md:text-8xl font-bold text-white/90 mb-3 md:mb-4 drop-shadow-lg">
                              {index + 1}
                            </div>
                            
                            {/* Icon */}
                            <div className="text-4xl md:text-5xl mb-3 md:mb-4 drop-shadow-lg">
                              {service.icon}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg">
                              {service.title}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-xs md:text-base text-white/80 leading-relaxed drop-shadow-md max-w-sm px-4">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </SwapCard>
                    ))}
                  </CardSwap>
                </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        {featuredProjects && featuredProjects.length > 0 && (
          <section className="py-20 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">Featured Projects</h2>
                <p className="text-lg text-gray-300">Check out some of our recent work</p>
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
                      <h3 className="text-sm md:text-xl font-bold text-white mb-1 md:mb-2 text-center">{project.name}</h3>
                      <p className="text-gray-300 mb-2 md:mb-4 text-xs md:text-base line-clamp-2 md:line-clamp-none text-center text-justify">
                        {project.description}
                      </p>
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
                      <div className="flex items-center gap-2 justify-center mt-2">
                        <span
                          className={`inline-block px-1.5 md:px-3 py-0.5 md:py-1 text-[10px] md:text-sm rounded-full ${
                            project.status === "completed"
                              ? "bg-gradient-to-r from-green-900 to-green-800 text-green-300 border border-green-700"
                              : project.status === "active"
                              ? "bg-gradient-to-r from-gray-800 to-black text-gray-300 border border-gray-700"
                              : "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 border border-gray-600"
                          }`}
                        >
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>

                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-sm rounded-full crystal-solid"
                          >
                            Demo
                          </a>
                        )}

                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-sm rounded-full crystal-solid"
                          >
                            GitHub
                          </a>
                        )}
                      </div>
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

        {/* Technologies we use (LogoLoop) - placed above CTA; tightened spacing */}
        <section className="py-1 md:py-3 bg-transparent -mt-6 md:mt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-2 text-center">
              <h3 className="text-base md:text-2xl font-semibold text-white">Technologies we use</h3>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <div className="w-full h-[36px] md:h-[72px] relative">
              <LogoLoop
                logos={techLogos}
                speed={80}
                direction="left"
                logoHeight={24}
                gap={18}
                hoverSpeed={0}
                scaleOnHover
                fadeOut
                fadeOutColor="#000000"
                ariaLabel="Technology partners"
                className="logoloop--responsive"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="pt-0 pb-20 md:pt-4 md:pb-40 text-white relative overflow-hidden"
          style={{ backgroundImage: "url(/getstarted.jpg)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-black/25" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center justify-start pt-0 md:pt-4 min-h-[160px] md:min-h-[320px]">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              suppressHydrationWarning
              className="w-full pt-0 md:pt-0"
            >
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="text-2xl md:text-6xl font-bold mb-4 md:mb-8 text-white"
              >
                Ready to build with Saaforge?
              </motion.h2>
              {/* optional description removed per request */}
              {/* Mobile CTA: two buttons in a row, contact spans full width below */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="w-full block md:hidden"
              >
                <div className="w-full grid grid-cols-2 gap-4">
                  <Link
                    href="/order"
                    className="col-span-1 flex items-center justify-center px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all text-center"
                  >
                    Request Project
                  </Link>

                  <Link
                    href="/join"
                    className="col-span-1 flex items-center justify-center px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all text-center"
                  >
                    Join the Team
                  </Link>

                  <Link
                    href="/contact"
                    className="col-span-2 flex items-center justify-center px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all text-center mt-2"
                  >
                    Contact Us
                  </Link>
                </div>
              </motion.div>

              {/* Desktop/Laptop CTA: keep original inline layout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                viewport={{ once: true }}
                className="hidden md:flex gap-4 justify-center items-center"
              >
                <Link href="/order" className="px-6 py-3 rounded-xl bg-white text-black font-semibold shadow-lg hover:shadow-xl transition-all crystal">
                  Request Project
                </Link>
                <Link href="/join" className="px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all">
                  Join the Team
                </Link>
                <Link href="/contact" className="px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all">
                  Contact Us
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function AboutSection() {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  const leftVidRef = useRef<HTMLVideoElement | null>(null);
  const rightVidRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setInView(e.isIntersecting));
      },
      { threshold: 0.2 }
    );
    obs.observe(ref.current);
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }
    onResize();
    window.addEventListener('resize', onResize);

    // attach handlers to slow down panel videos when they become available
    const setLeftRate = () => { if (leftVidRef.current) leftVidRef.current.playbackRate = 0.6; };
    const setRightRate = () => { if (rightVidRef.current) rightVidRef.current.playbackRate = 0.6; };

    if (leftVidRef.current) {
      leftVidRef.current.addEventListener('loadedmetadata', setLeftRate);
      leftVidRef.current.addEventListener('canplay', setLeftRate);
    }
    if (rightVidRef.current) {
      rightVidRef.current.addEventListener('loadedmetadata', setRightRate);
      rightVidRef.current.addEventListener('canplay', setRightRate);
    }

    return () => {
      if (leftVidRef.current) {
        leftVidRef.current.removeEventListener('loadedmetadata', setLeftRate);
        leftVidRef.current.removeEventListener('canplay', setLeftRate);
      }
      if (rightVidRef.current) {
        rightVidRef.current.removeEventListener('loadedmetadata', setRightRate);
        rightVidRef.current.removeEventListener('canplay', setRightRate);
      }
      obs.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Use horizontal slide for both desktop and mobile for consistent behavior
  const leftInitial = { x: '-100%', opacity: 0 };
  const rightInitial = { x: '100%', opacity: 0 };
  const visibleAnim = { x: 0, y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } as any;

  return (
    <div ref={ref as any} className="relative">
        <section className="relative w-full left-0 overflow-hidden md:min-h-screen min-h-[72vh]">
          <motion.div
            initial={leftInitial}
            animate={inView ? visibleAnim : leftInitial}
              className="absolute left-0 top-0 md:bottom-0 md:h-screen h-[72vh] md:w-1/4 w-[32%] crystal-glass backdrop-blur-ld bg-clip-padding z-20 overflow-hidden flex flex-col p-3 md:p-12 md:pr-8 shadow-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <video
              ref={leftVidRef}
              src="/panal_bg.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ filter: 'blur(2px)', opacity: 0.16 }}
            />
            <div className="md:max-w-md mt-6">
              <h2 className="text-lg md:text-4xl font-semibold text-white">Vision</h2>
              <p className="mt-2 text-gray-300 leading-relaxed text-[9px] md:text-xs">
                We craft tools and experiences that empower creators and builders to turn ideas
                into meaningful projects. Saaforge envisions a future where technology and
                collaboration unlock human potential.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={rightInitial}
            animate={inView ? visibleAnim : rightInitial}
            className="absolute right-0 top-0 md:bottom-0 md:h-screen h-[72vh] md:w-1/4 w-[32%] crystal-glass backdrop-blur-lg bg-clip-padding z-20 overflow-hidden flex flex-col p-3 md:p-12 md:pl-8 items-end text-right shadow-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <video
              ref={rightVidRef}
              src="/panal_bg.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ filter: 'blur(2px)', opacity: 0.16 }}
            />
            <div className="md:max-w-md mt-4 md:mt-6 w-full h-full flex flex-col justify-end pb-6 md:pt-80">
              <h2 className="text-lg md:text-4xl font-semibold text-white">Mission</h2>
              <p className="mt-2 text-gray-300 leading-relaxed text-[9px] md:text-xs">
                To build inclusive, reliable, and delightful developer tools and communities
                that accelerate human creativity. We focus on clarity, quality, and
                collaboration.
              </p>
            </div>
          </motion.div>

          <div className="relative z-50 pointer-events-auto flex items-center justify-center min-h-[72vh] md:min-h-screen">
            <div className="text-center px-4 md:px-2 md:w-[40%] w-11/12">
              <h3 className="text-lg md:text-3xl font-semibold text-white mb-2 md:mb-4">About Saaforge</h3>
            </div>
          </div>
        </section>
    </div>
  );
}
