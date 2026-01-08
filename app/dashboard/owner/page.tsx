'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCollection } from '@/lib/hooks/useFirestore';
import { JoinRequest, Order, TeamProfile, Project } from '@/lib/types';
import { where } from 'firebase/firestore';

export default function OwnerDashboardPage() {
  const { data: pendingRequests } = useCollection<JoinRequest>('joinRequests', [
    where('status', '==', 'pending'),
  ]);

  const { data: newOrders } = useCollection<Order>('orders', [
    where('status', '==', 'new'),
  ]);

  const { data: allTeamMembers } = useCollection<TeamProfile>('teamProfiles');
  
  const { data: projects } = useCollection<Project>('projects');
  // Filter out email-based duplicates and incomplete profiles (same as team management page)
  const teamMembers = allTeamMembers?.filter((member) => {
    // Filter out email-based IDs (old duplicates from before UID-based fix)
    if (member.id.includes('@')) {
      return false;
    }
    
    // Show if any of these conditions are true:
    // 1. Profile is approved (owner approved them)
    // 2. Name is filled AND (has bio OR has skills OR has interests)
    // 3. Has role filled (from join request)
    return (
      member.isApproved ||
      (member.name && member.name.trim() !== '' && 
        (member.bio || (member.skills && member.skills.length > 0) || (member.interests && member.interests.length > 0))
      ) ||
      (member.role && member.role.trim() !== '')
    );
  });


  const stats = [
    {
      label: 'Pending Requests',
      value: pendingRequests?.length || 0,
      icon: '👥',
      color: 'bg-gray-800 text-gray-300',
      link: '/dashboard/owner/requests',
    },
    {
      label: 'New Orders',
      value: newOrders?.length || 0,
      icon: '📦',
      color: 'bg-gray-800 text-gray-300',
      link: '/dashboard/owner/orders',
    },
    {
      label: 'Team Members',
      value: teamMembers?.length || 0,
      icon: '⚙️',
      color: 'bg-gray-800 text-gray-300',
      link: '/dashboard/owner/team',
    },
    {
      label: 'Total Projects',
      value: projects?.length || 0,
      icon: '📁',
      color: 'bg-gray-800 text-gray-300',
      link: '/dashboard/owner/projects',
    },
  ];

  return (
    <ProtectedRoute requiredRole="owner">
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >


            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-6 mb-6 md:mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={stat.link}>
                    <Card hover className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <div>
                          <p className="text-[10px] md:text-sm text-gray-400 mb-1\">{stat.label}</p>
                          <p className="text-lg md:text-3xl font-bold text-white\">{stat.value}</p>
                        </div>
                        <div className={`w-8 h-8 md:w-16 md:h-16 rounded-full ${stat.color} flex items-center justify-center text-lg md:text-3xl`}>
                          {stat.icon}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
              <Card>
                <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Quick Actions</h2>
                <div className="space-y-2 md:space-y-3">
                  <Link href="/dashboard/owner/projects">
                    <Button variant="outline" className="w-full justify-start">
                      📁 Create New Project
                    </Button>
                  </Link>
                  <Link href="/dashboard/owner/requests">
                    <Button variant="outline" className="w-full justify-start">
                      ✉️ Generate Invite Code
                    </Button>
                  </Link>
                  <Link href="/dashboard/owner/content">
                    <Button variant="outline" className="w-full justify-start">
                      ✏️ Edit Site Content
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Recent Activity</h2>
                <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-400">
                  {pendingRequests && pendingRequests.length > 0 ? (
                    <>
                      <p>• {pendingRequests.length} pending join request(s)</p>
                      <Link href="/dashboard/owner/requests">
                        <Button variant="ghost" size="sm">
                          Review Requests →
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <p>No pending join requests</p>
                  )}
                  {newOrders && newOrders.length > 0 ? (
                    <>
                      <p>• {newOrders.length} new order(s)</p>
                      <Link href="/dashboard/owner/orders">
                        <Button variant="ghost" size="sm">
                          View Orders →
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <p>No new orders</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Welcome Message */}
            <Card>
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to Saaforge Dashboard</h2>
              <p className="text-gray-300 mb-4">
                Manage your team, projects, and client requests all in one place. Use the sidebar
                to navigate between different sections.
              </p>
              <div className="flex gap-4">
                <Link href="/">
                  <Button variant="outline">View Public Site</Button>
                </Link>
                <Link href="/dashboard/owner/audit">
                  <Button variant="ghost">View Audit Logs</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
