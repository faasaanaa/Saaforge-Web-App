// Temporary minimal page to isolate Turbopack parser errors
// Temporary minimal page to isolate Turbopack parser errors
import { Suspense } from 'react';
import ProjectRouterClient from './ProjectRouterClient';

export default function ProjectPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Suspense fallback={null}>
        <ProjectRouterClient />
      </Suspense>
    </div>
  );
}

