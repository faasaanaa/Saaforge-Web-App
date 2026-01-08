'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export default function PrivacyPolicyPage() {
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
            <h2 className="text-4xl font-bold text-white mb-2">Privacy Policy</h2>
            <p className="text-gray-300">Last updated: January 6, 2026</p>
          </div>

          <Card className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-2xl font-bold text-white mb-3">1. Information We Collect</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Name, email address, password, and profile picture</li>
                  <li><strong>Profile Data:</strong> Bio, skills, interests, experience, achievements, portfolio links, and social media links</li>
                  <li><strong>Project Data:</strong> Projects, tasks, team assignments, grades, and feedback</li>
                  <li><strong>Usage Data:</strong> Information about how you use our Service, including access times and pages viewed</li>
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">2. How We Use Your Information</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Provide, maintain, and improve our Service</li>
                  <li>Create and manage your account</li>
                  <li>Enable team collaboration and project management</li>
                  <li>Display your public profile and portfolio</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                  <li>Detect and prevent fraud and abuse</li>
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">3. Information Sharing</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong>Within Your Team:</strong> Your profile information, assigned tasks, and grades are visible to your team owner and other team members</li>
                  <li><strong>Public Profiles:</strong> Information you choose to make public (portfolio, achievements) may be visible to anyone</li>
                  <li><strong>Service Providers:</strong> We use Firebase (Google) for hosting, authentication, and data storage</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-3">
                  We do not sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">4. Data Storage and Security</h3>
                <p className="text-gray-300 leading-relaxed">
                  Your data is stored using Firebase (Google Cloud Platform) with industry-standard security measures. 
                  We use encryption, secure authentication, and access controls to protect your information. However, 
                  no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">5. Authentication</h3>
                <p className="text-gray-300 leading-relaxed">
                  We use Firebase Authentication for secure login. When you sign in with Google, we receive your 
                  name, email address, and profile picture from Google in accordance with their privacy policy.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">6. Your Rights and Choices</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Access and update your profile information at any time</li>
                  <li>Delete your account and associated data</li>
                  <li>Control what information is public vs. private</li>
                  <li>Opt out of promotional communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">7. Cookies and Tracking</h3>
                <p className="text-gray-300 leading-relaxed">
                  We use cookies and similar technologies to maintain your session, remember your preferences, 
                  and analyze how you use our Service. You can control cookies through your browser settings.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">8. Children's Privacy</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our Service is not directed to children under 13. We do not knowingly collect personal 
                  information from children under 13. If you believe we have collected such information, 
                  please contact us immediately.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">9. Data Retention</h3>
                <p className="text-gray-300 leading-relaxed">
                  We retain your information for as long as your account is active or as needed to provide 
                  the Service. When you delete your account, we will delete your personal information, 
                  though some data may be retained in backups for a limited period.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">10. International Data Transfers</h3>
                <p className="text-gray-300 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your information.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">11. Changes to This Policy</h3>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant 
                  changes by email or through the Service. Your continued use after changes indicates 
                  acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-white mb-3">12. Contact Us</h3>
                <p className="text-gray-300 leading-relaxed">
                  If you have questions about this Privacy Policy or our data practices, please contact us at:{' '}
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
