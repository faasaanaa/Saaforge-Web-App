"use client";

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const ProjectDetailClient = dynamic(() => import('@/components/ProjectDetailClient'), { ssr: false });
const ProjectRequestClient = dynamic(() => import('@/components/ProjectRequestClient'), { ssr: false });

export default function ProjectRouterClient() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') ?? undefined;

  return id ? <ProjectDetailClient projectId={id} /> : <ProjectRequestClient />;
}
