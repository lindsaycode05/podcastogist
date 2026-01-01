import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const DemoNoticeBanner = () => {
  return (
    <div className='sticky top-16 z-40 pt-1'>
      <div className='glass-card rounded-2xl border border-blue-200/60 dark:border-blue-500/30 shadow-lg'>
        <div className='flex flex-col gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-xl gradient-sunrise p-2 shadow-md'>
              <Sparkles className='h-4 w-4 text-white' />
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-900 dark:text-slate-100'>
                You&apos;re viewing a sample project.
              </p>
              <p className='hidden md:inline text-xs text-gray-600 dark:text-slate-300'>
                Instant preview with real outputs, no upload required.
              </p>
            </div>
          </div>
          <Link href='/dashboard/upload'>
            <Button className='flex md:hidden gradient-sunrise text-white hover-glow shadow-lg text-sm px-4 py-3'>
              Sign in to upload your own podcast &rarr;
            </Button>
            <Button className='hidden md:flex gradient-sunrise text-white hover-glow shadow-lg text-sm px-4 py-3'>
              Want to upload your own podcast? Sign in &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
