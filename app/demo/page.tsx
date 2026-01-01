import { preloadQuery } from 'convex/nextjs';
import { Sparkles } from 'lucide-react';
// import { DemoProjectsList } from '@/components/demo/demo-projects-list';
import { Badge } from '@/components/ui/badge';
import { api } from '@/convex/_generated/api';

const DemoPage = async () => {
  const _preloadedProjects = await preloadQuery(api.demo.listProjects, {});

  return (
    <div className='min-h-screen mesh-background-subtle -mt-4 xl:-mt-10 pt-4 xl:pt-10'>
      <div className='container max-w-6xl mx-auto py-14 px-4'>
        <div className='text-center mb-12 space-y-4'>
          <Badge className='gradient-sunrise text-white border-0 shadow-md inline-flex items-center gap-2 px-4 py-1'>
            <Sparkles className='h-4 w-4' />
            Instant demo
          </Badge>
          <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-slate-100'>
            Pick a sample podcast
          </h1>
          <p className='text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed'>
            Explore pre-generated AI outputs in seconds. Each sample is ready
            with recaps, highlights, social posts, timestamps, and more.
          </p>
        </div>

        {/* <DemoProjectsList preloadedProjects={preloadedProjects} /> */}
      </div>
    </div>
  );
};

export default DemoPage;
