import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-black to-gray-900 text-gray-300 border-t border-gray-800" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" suppressHydrationWarning>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" suppressHydrationWarning>
          <div className="col-span-2 md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">Saaforge</h3>
            <p className="text-gray-400 mb-4">
              Building premium software solutions for modern businesses.
              Automation, custom software, and web development.
            </p>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/owner" className="hover:text-white transition-colors">
                  About Owner
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-4">Get Started</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/order" className="hover:text-white transition-colors">
                  Request Work
                </Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-white transition-colors">
                  Join Our Team
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Team Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400" suppressHydrationWarning>
          <p>&copy; {currentYear} Saaforge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
