'use client';

import type { Preloaded } from 'convex/react';
import { usePreloadedQuery } from 'convex/react';
import Link from 'next/link';
import { DemoProjectCard } from '@/components/demo/demo-project-card';
import { Button } from '@/components/ui/button';
import type { api } from '@/convex/_generated/api';

interface DemoProjectsListProps {
  preloadedProjects: Preloaded<typeof api.demo.listProjects>;
}

export const DemoProjectsList = ({
  preloadedProjects
}: DemoProjectsListProps) => {
  const projects = usePreloadedQuery(preloadedProjects);

  if (!projects || projects.length === 0) {
    return (
      <div className='glass-card rounded-2xl p-10 text-center space-y-6'>
        <p className='text-lg text-gray-600 dark:text-slate-300'>
          Demo samples are refreshing right now. Please check back shortly.
        </p>
        <Link href='/dashboard/upload'>
          <Button className='gradient-sunrise text-white hover-glow shadow-lg px-6 py-5 text-base'>
            Sign in to upload your own podcast
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='grid gap-6 @container'>
      {projects.map((project) => (
        <DemoProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
};
