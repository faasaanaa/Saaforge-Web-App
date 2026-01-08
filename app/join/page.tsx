'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { createDocument } from '@/lib/hooks/useFirestore';
import { JoinRequest } from '@/lib/types';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/Loading';

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

export default function JoinPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    achievements: '',
    githubUrl: '',
    linkedinUrl: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/join');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const portfolioLinks = [];
      if (formData.githubUrl) portfolioLinks.push(formData.githubUrl);
      if (formData.linkedinUrl) portfolioLinks.push(formData.linkedinUrl);

      const joinRequest: Omit<JoinRequest, 'id' | 'createdAt'> = {
        userId: user.uid, // Include user UID for creating teamProfile later
        name: formData.name,
        email: formData.email,
        skills: skills,
        interests: interests,
        achievements: formData.achievements 
          ? formData.achievements.split('\n').filter((s) => s.trim())
          : [],
        reason: formData.reason,
        portfolioLinks: portfolioLinks,
        status: 'pending',
      };

      await createDocument<JoinRequest>('joinRequests', joinRequest);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full mx-4"
          >
            <Card className="text-center">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Application Submitted!
              </h2>
              <p className="text-gray-300 mb-6">
                Thank you for your interest in joining Saaforge. We'll review your application
                and get back to you soon.
              </p>
              <p className="text-sm text-gray-400">Redirecting to home...</p>
            </Card>
          </motion.div>
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
        <section className="bg-gradient-to-br from-black via-gray-900 to-black py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Join Our <span className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 bg-clip-text text-transparent">Team</span>
              </h1>
              <p className="text-xl text-gray-300">
                Be part of something amazing. Apply to join Saaforge today.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Application Form</h2>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-950/60 border border-red-700 rounded-lg text-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />

                  <AutocompleteInput
                    label="Skills"
                    value={skills}
                    onChange={setSkills}
                    suggestions={SKILL_SUGGESTIONS}
                    placeholder="Start typing to search skills (e.g., Python, React)"
                    helperText="Type and select from suggestions, or add your own"
                    required
                  />

                  <AutocompleteInput
                    label="Interests"
                    value={interests}
                    onChange={setInterests}
                    suggestions={INTEREST_SUGGESTIONS}
                    placeholder="Start typing to search interests (e.g., AI, Web Development)"
                    helperText="What areas of technology interest you?"
                  />

                  <Textarea
                    label="Achievements (Optional)"
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleChange}
                    rows={4}
                    placeholder="List your achievements (one per line)"
                    helperText="Share your proudest accomplishments"
                  />

                  <Textarea
                    label="Why do you want to join Saaforge?"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell us why you'd be a great fit for our team"
                  />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-100">Portfolio Links (Optional)</h3>
                    
                    <Input
                      label="GitHub Profile"
                      name="githubUrl"
                      type="url"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/yourusername"
                    />

                    <Input
                      label="LinkedIn Profile"
                      name="linkedinUrl"
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={loading}
                  >
                    Submit Application
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
