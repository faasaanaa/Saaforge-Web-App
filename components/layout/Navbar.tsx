'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { TeamProfile } from '@/lib/types';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, firebaseUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isTeamApproved, setIsTeamApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);
  
  // Owner email list (must match AuthContext)
  const OWNER_EMAILS = ['saaforge@gmail.com', 'emsaadsaad580@gmail.com'];
  
  // Check if current user is owner by email
  const isOwner = firebaseUser?.email && OWNER_EMAILS.includes(firebaseUser.email);

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/owner', label: 'Owner' },
    { href: '/team', label: 'Team' },
    { href: '/projects', label: 'Projects' },
  ];

  const ctaLinks = [
    { href: '/order', label: 'Request Work' },
    { href: '/join', label: 'Join Team' },
  ];

  // Check if team member is approved
  useEffect(() => {
    const checkApproval = async () => {
      if (user?.uid && db) {
        // Check for approved teamProfile regardless of current role
        // This handles the case where role is still 'user' in Firestore but approval exists
        try {
          setCheckingApproval(true);
          let isApproved = false;
          
          // Try UID first
          let teamProfileRef = doc(db, 'teamProfiles', user.uid);
          let teamProfileDoc = await getDoc(teamProfileRef);
          
          if (teamProfileDoc.exists()) {
            const profileData = teamProfileDoc.data() as TeamProfile;
            if (profileData.isApproved === true) {
              isApproved = true;
            }
          }
          
          // If not found by UID or not approved, try email
          if (!isApproved && user.email) {
            teamProfileRef = doc(db, 'teamProfiles', user.email);
            teamProfileDoc = await getDoc(teamProfileRef);
            
            if (teamProfileDoc.exists()) {
              const profileData = teamProfileDoc.data() as TeamProfile;
              if (profileData.isApproved === true) {
                isApproved = true;
              }
            }
          }
          
          setIsTeamApproved(isApproved);
        } catch (error) {
          setIsTeamApproved(false);
        } finally {
          setCheckingApproval(false);
        }
      } else {
        setIsTeamApproved(false);
      }
    };

    checkApproval();
  }, [user?.uid, user?.email]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Sign out error - silent fail
    }
  };

  // Show Dashboard if: owner OR (approved team member)
  const canShowDashboard = user?.role === 'owner' || (user?.role === 'team' && isTeamApproved);

  // Hide navbar on dashboard owner/team pages and on auth pages (login/register)
  if (typeof pathname === 'string' && (
    pathname.startsWith('/dashboard/owner') ||
    pathname.startsWith('/dashboard/team') ||
    pathname === '/login' ||
    pathname === '/register'
  )) {
    return null;
  }
  return (
    <nav className="absolute inset-x-0 top-0 w-full z-50 bg-transparent" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex justify-between items-center h-16" suppressHydrationWarning>
          <div className="flex items-center" suppressHydrationWarning>
            <Link href="/" className="flex items-center">
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 bg-clip-text text-transparent">Saaforge</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" suppressHydrationWarning>
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-gray-100 border-b-2 border-gray-300'
                    : 'text-gray-400 hover:text-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4" suppressHydrationWarning>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {firebaseUser?.photoURL ? (
                    <img
                      src={firebaseUser.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-semibold">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-lg shadow-gray-900/50 border border-gray-700 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-800">
                        <p className="text-sm font-medium text-white">{firebaseUser?.displayName || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      {(isOwner || (user?.role === 'team' && isTeamApproved)) && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            if (isOwner) {
                              router.push('/dashboard/owner');
                            } else {
                              router.push('/dashboard/team');
                            }
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                {ctaLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant={link.href === '/order' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => router.push(link.href)}
                  >
                    {link.label}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                  Login
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden" suppressHydrationWarning>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Floating Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-20 left-4 right-4 md:hidden z-50 bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-gray-700/50 backdrop-blur-xl"
            >
              <div className="px-6 py-6 space-y-4">
                {publicLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`block py-3 text-base font-medium text-center rounded-xl transition-all ${
                        pathname === link.href 
                          ? 'text-white bg-white/10 border border-white/20' 
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="border-t border-gray-800 pt-4 space-y-3">
                  {user ? (
                    <>
                      {(isOwner || (user.role === 'team' && isTeamApproved)) && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: publicLinks.length * 0.1 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              if (isOwner) {
                                router.push('/dashboard/owner');
                              } else {
                                router.push('/dashboard/team');
                              }
                            }}
                          >
                            Dashboard
                          </Button>
                        </motion.div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (publicLinks.length + 1) * 0.1 }}
                      >
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full">
                          Sign Out
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {ctaLinks.map((link, index) => (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (publicLinks.length + index) * 0.1 }}
                        >
                          <Button
                            variant={link.href === '/order' ? 'primary' : 'outline'}
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              router.push(link.href);
                            }}
                          >
                            {link.label}
                          </Button>
                        </motion.div>
                      ))}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (publicLinks.length + ctaLinks.length) * 0.1 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            router.push('/login');
                          }}
                        >
                          Login
                        </Button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
