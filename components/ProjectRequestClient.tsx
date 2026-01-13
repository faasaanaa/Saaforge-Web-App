 'use client';

import React from 'react';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Footer } from '@/components/layout/Footer';

export default function ProjectRequestClient() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <main className="flex-1 flex items-center justify-center allow-video">
        <div className="max-w-xl w-full p-8 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-6">Request a Project</h2>
          <p className="text-gray-400">Project request form is available in the dashboard.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

