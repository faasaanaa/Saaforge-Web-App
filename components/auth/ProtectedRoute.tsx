'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/Loading';
import { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireTeamApproval?: boolean;
}

export function ProtectedRoute({ children, requiredRole, requireTeamApproval }: ProtectedRouteProps) {
  const { user, loading, isTeamApproved } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!loading) {
      let authorized = false;
      let shouldRedirect = false;
      let redirectPath = '';

      if (!user) {
        // Not authenticated - redirect to login
        shouldRedirect = true;
        redirectPath = '/login';
      } else if (requiredRole && user.role !== requiredRole) {
        // User logged in but doesn't have required role
        if (user.role === 'team' && requiredRole === 'owner') {
          // Team member trying to access owner page - redirect to home
          shouldRedirect = true;
          redirectPath = '/';
        } else if (user.role === 'owner' && requiredRole === 'team') {
          // Owner trying to access team page - allow (owners can switch views)
          authorized = true;
        }
      } else {
        // User has the required role
        authorized = true;
      }

      // Additional approval gate for team pages if requested (owners bypass)
      if (
        authorized &&
        requireTeamApproval &&
        requiredRole === 'team' &&
        user?.role === 'team'
      ) {
        if (!isTeamApproved) {
          authorized = false;
          shouldRedirect = true;
          redirectPath = '/';
        }
      }

      if (shouldRedirect && !hasRedirected && pathname !== redirectPath) {
        setHasRedirected(true);
        router.replace(redirectPath);
      }

      setIsAuthorized(authorized);
    }
  }, [user, loading, requiredRole, requireTeamApproval, isTeamApproved, router, pathname, hasRedirected]);

  // Still loading auth - show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Auth loaded but not authorized - show redirecting state
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="sr-only">Redirecting...</span>
      </div>
    );
  }

  // Authorized - show children
  return <>{children}</>;
}
