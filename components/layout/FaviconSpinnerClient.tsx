"use client";

import { useEffect } from 'react';
import { startFaviconSpinner, stopFaviconSpinner } from '@/lib/utils/faviconSpinner';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function FaviconSpinnerClient() {
  const { loading } = useAuth();

  useEffect(() => {
    // Toggle spinner based on global auth loading only
    if (loading) {
      startFaviconSpinner();
    } else {
      stopFaviconSpinner();
    }
    return () => {
      stopFaviconSpinner();
    };
  }, [loading]);

  return null;
}
