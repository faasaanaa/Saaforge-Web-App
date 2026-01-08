'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 bg-clip-text text-transparent">Saaforge</h1>
            </Link>
            <h2 className="text-4xl font-bold text-white mb-2">Terms of Service</h2>
            <p className="text-gray-300">Last updated: January 6, 2026</p>
          </div>

          <Card className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h3>
                <p className="text-gray-300 leading-relaxed">
                  By accessing and using Saaforge ("the Service"), you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">2. Description of Service</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Saaforge is a team collaboration and project management platform that enables:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Project creation and management</li>
                  <li>Team member collaboration</li>
                  <li>Task assignment and tracking</li>
                  <li>Profile and portfolio management</li>
                  <li>Team performance grading and feedback</li>
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">3. User Accounts</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  To use Saaforge, you must:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">4. User Responsibilities</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Use the Service only for lawful purposes</li>
                  <li>Not upload malicious code or viruses</li>
                  <li>Not interfere with or disrupt the Service</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not impersonate others or misrepresent your affiliation</li>
                  <li>Maintain professional conduct when collaborating with team members</li>
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">5. Content Ownership</h3>
                <p className="text-gray-300 leading-relaxed">
                  You retain ownership of all content you upload to Saaforge (projects, tasks, profiles, etc.). 
                  By uploading content, you grant Saaforge a license to store, display, and transmit your content 
                  as necessary to provide the Service.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">6. Team Collaboration</h3>
                <p className="text-gray-300 leading-relaxed">
                  Team owners are responsible for managing their teams, including inviting members, assigning tasks, 
                  and providing grades. Team members agree to complete assigned tasks in good faith and maintain 
                  professional standards.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">7. Termination</h3>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to suspend or terminate your account if you violate these Terms of Service. 
                  You may terminate your account at any time by contacting us.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">8. Disclaimer of Warranties</h3>
                <p className="text-gray-300 leading-relaxed">
                  The Service is provided "as is" without warranties of any kind, either express or implied. 
                  We do not guarantee that the Service will be uninterrupted, secure, or error-free.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">9. Limitation of Liability</h3>
                <p className="text-gray-300 leading-relaxed">
                  Saaforge shall not be liable for any indirect, incidental, special, consequential, or punitive 
                  damages resulting from your use of the Service.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">10. Changes to Terms</h3>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to modify these Terms of Service at any time. We will notify users of 
                  significant changes via email or through the Service. Continued use after changes constitutes 
                  acceptance of the new terms.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">11. Contact Information</h3>
                <p className="text-gray-300 leading-relaxed">
                  For questions about these Terms of Service, please contact us at:{' '}
                  <a href="mailto:saaforge@gmail.com" className="text-blue-400 hover:text-blue-300">
                    saaforge@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <Link href="/" className="text-blue-400 hover:text-blue-300 font-medium">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
