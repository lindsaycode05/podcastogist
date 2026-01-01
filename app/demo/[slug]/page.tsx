'use client';

import { useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// import { DemoGradientOrbs } from '@/components/demo/demo-gradient-orbs';
// import { DemoProjectDetail } from '@/components/demo/demo-project-detail';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';

const DemoProjectPage = () => {
  const params = useParams();
  const slugParam = params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const project = useQuery(api.demo.getProjectBySlug, {
    slug: slug || ''
  });

  if (project === undefined) {
    return (
      <div className='container max-w-6xl mx-auto py-10 px-4'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <Loader2 className='h-8 w-8 animate-spin text-blue-600 dark:text-blue-300' />
        </div>
        {/* <DemoGradientOrbs /> */}
      </div>
    );
  }

  if (!project) {
    return (
      <div className='container max-w-4xl mx-auto py-10 px-4'>
        <Card>
          <CardContent className='text-center space-y-4'>
            <p className='text-lg text-gray-600 dark:text-slate-300'>
              This sample is unavailable right now.
            </p>
            <Link href='/demo'>
              <Button className='gradient-sunrise text-white hover-glow shadow-lg px-6 py-5 text-base'>
                View available podcast samples
              </Button>
            </Link>
          </CardContent>
        </Card>
        {/* <DemoGradientOrbs /> */}
      </div>
    );
  }

  // return <DemoProjectDetail project={project} />;
};

export default DemoProjectPage;
