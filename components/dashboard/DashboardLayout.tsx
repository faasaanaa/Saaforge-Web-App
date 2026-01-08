'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { useCollection } from '@/lib/hooks/useFirestore';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Message } from '@/lib/types';
import { where } from 'firebase/firestore';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, firebaseUser, signOut } = useAuth();
  const [viewMode, setViewMode] = useState<'owner' | 'team'>(
    pathname.includes('/dashboard/owner') ? 'owner' : 'team'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get all messages to count unread ones
  const { data: allMessages } = useCollection<Message>('messages');
  const unreadCount = allMessages?.filter((msg) => !msg.isRead && msg.senderId !== user?.uid).length || 0;

  // Get notification counts
  const { notificationCounts } = useNotifications();

  // Get user's team profile for display picture
  const { data: teamProfiles } = useCollection<any>('teamProfiles');
  const userProfile = teamProfiles?.find((p) => 
    p.userId === user?.uid || 
    p.id === user?.uid || 
    p.userId === user?.email || 
    p.id === user?.email
  );

  // Get owner profile for owner view
  const { data: ownerProfiles } = useCollection<any>('ownerProfiles');
  const ownerProfile = ownerProfiles?.find((p) => p.id === user?.uid);

  const isOwner = user?.role === 'owner';

  const ownerLinks = [
    { href: '/dashboard/owner', label: 'Overview', icon: '📊', notificationKey: null },
    { href: '/dashboard/owner/profile', label: 'My Profile', icon: '👤', notificationKey: null },
    { href: '/dashboard/owner/requests', label: 'Join Requests', icon: '👥', notificationKey: 'requests' as const },
    { href: '/dashboard/owner/team', label: 'Team Management', icon: '⚙️', notificationKey: 'team' as const },
    { href: '/dashboard/owner/chat', label: 'Team Chat', icon: '💬', notificationKey: null },
    { href: '/dashboard/owner/projects', label: 'Projects', icon: '📁', notificationKey: null },
    { href: '/dashboard/owner/tasks', label: 'Manage Tasks', icon: '✅', notificationKey: null },
    { href: '/dashboard/owner/applications', label: 'Applications', icon: '📝', notificationKey: 'applications' as const },
    { href: '/dashboard/owner/ideas', label: 'Project Ideas', icon: '💡', notificationKey: 'ideas' as const },
    { href: '/dashboard/owner/orders', label: 'Orders', icon: '📦', notificationKey: 'orders' as const },
    { href: '/dashboard/owner/feedback', label: 'Feedback', icon: '💬', notificationKey: 'feedback' as const },
    { href: '/dashboard/owner/content', label: 'Content', icon: '📝', notificationKey: 'content' as const },
    { href: '/dashboard/owner/audit', label: 'Audit Logs', icon: '📋', notificationKey: 'audit' as const },
  ];

  const teamLinks = [
    { href: '/dashboard/team', label: 'Dashboard', icon: '📊', notificationKey: null },
    { href: '/dashboard/team/profile', label: 'My Profile', icon: '👤', notificationKey: null },
    { href: '/dashboard/team/chat', label: 'Chat with Owner', icon: '💬', notificationKey: null },
    { href: '/dashboard/team/projects', label: 'Browse Projects', icon: '📁', notificationKey: 'projects' as const },
    { href: '/dashboard/team/tasks', label: 'My Tasks', icon: '✅', notificationKey: 'tasks' as const },
    { href: '/dashboard/team/feedback', label: 'Feedback & Ideas', icon: '📢', notificationKey: 'feedback' as const },
    { href: '/dashboard/team/ideas', label: 'Submit Ideas', icon: '💡', notificationKey: 'ideas' as const },
  ];

  // Use viewMode to determine which links to show, not isOwner
  const links = viewMode === 'owner' ? ownerLinks : teamLinks;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Sign out error - silent fail
    }
  };

  const handleToggleView = () => {
    const newMode = viewMode === 'owner' ? 'team' : 'owner';
    setViewMode(newMode);
    router.push(newMode === 'owner' ? '/dashboard/owner' : '/dashboard/team');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-20 md:hidden">
        {/* Menu Button - Hidden when sidebar is open */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-semibold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 shadow-lg shadow-black/40 backdrop-blur hover:from-gray-700 hover:to-gray-800 transition-all ${
            sidebarOpen ? 'hidden' : 'flex'
          }`}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Page Title - Centered */}
        <h1 className="text-lg font-bold text-white flex-1 text-center">
          {pathname.includes('/profile') && 'My Profile'}
          {pathname.includes('/chat') && (pathname.includes('/owner') ? 'Team Chat' : 'Chat with Owner')}
          {pathname.includes('/projects') && (pathname.includes('/owner') ? 'Projects' : 'Browse Projects')}
          {pathname.includes('/tasks') && (pathname.includes('/owner') ? 'Manage Tasks' : 'My Tasks')}
          {pathname.includes('/feedback') && 'Feedback & Ideas'}
          {pathname.includes('/ideas') && (pathname.includes('/owner') ? 'Project Ideas' : 'Submit Ideas')}
          {pathname.includes('/requests') && 'Join Requests'}
          {pathname.includes('/team') && !pathname.includes('/chat') && !pathname.includes('/profile') && 'Team Management'}
          {pathname.includes('/applications') && 'Applications'}
          {pathname.includes('/orders') && 'Orders'}
          {pathname.includes('/content') && 'Content'}
          {pathname.includes('/audit') && 'Audit Logs'}
          {(pathname === '/dashboard/owner' || pathname === '/dashboard/team') && 'Dashboard'}
        </h1>

        {/* Empty space for balance */}
        <div className="w-10" />
      </header>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-25 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-lg z-26 border-r border-gray-800 transform transition-transform duration-300 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo with Close Button */}
          <div className="px-6 py-4 border-b border-gray-800 relative">
            {/* Close Button - Top Right */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg font-semibold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700 shadow-lg shadow-black/40 backdrop-blur hover:from-gray-700 hover:to-gray-800 transition-all"
              aria-label="Close menu"
            >
              ✕
            </button>
            
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">Saaforge</h1>
            </Link>
            <p className="text-sm text-gray-400 mt-1">
              {viewMode === 'owner' ? 'Owner Dashboard' : 'Team Dashboard'}
            </p>
            
            {/* Dashboard Toggle for Owner */}
            {isOwner && (
              <button
                onClick={handleToggleView}
                className="mt-2 w-full px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-xs font-medium rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-sm border border-gray-600"
              >
                {viewMode === 'owner' ? '👤 Switch to Team View' : '👑 Switch to Owner View'}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const notificationCount = link.notificationKey ? notificationCounts[link.notificationKey] : 0;
              const showBadge = notificationCount > 0;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                    pathname === link.href
                      ? 'bg-gray-800 text-gray-300 font-medium border-l-2 border-gray-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                  {/* Unread indicator for chat */}
                  {link.href.includes('/chat') && unreadCount > 0 && (
                    <span className="ml-auto flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {/* Notification badge for other sections */}
                  {!link.href.includes('/chat') && showBadge && (
                    <span className="ml-auto flex items-center justify-center min-w-5 h-5 px-1.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="px-4 py-4 border-t border-gray-800 mt-auto">
            <div className="flex items-center gap-3">
              {viewMode === 'team' ? (
                <>
                  {userProfile?.profilePicture ? (
                    <img
                      src={userProfile.profilePicture}
                      alt={userProfile.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border border-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {userProfile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-300 truncate">
                    {userProfile?.name || user?.email || 'User'}
                  </span>
                </>
              ) : (
                <>
                  {ownerProfile?.profilePicture || firebaseUser?.photoURL ? (
                    <img
                      src={ownerProfile?.profilePicture || firebaseUser?.photoURL}
                      alt={ownerProfile?.name || 'Owner'}
                      className="w-10 h-10 rounded-full object-cover border border-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {ownerProfile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'O'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-300 truncate">
                    {ownerProfile?.name || user?.email || 'Owner'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 bg-black min-h-screen pt-20 md:pt-8 px-4 md:px-8 pb-8">
        {children}
      </div>
    </div>
  );
}
