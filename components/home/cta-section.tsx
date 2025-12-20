import { SignInButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { Upload } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const CtaSection = async () => {
  const { isAuthenticated } = await auth();

  return (
    <section className='relative py-24 md:py-32 overflow-hidden'>
      {/* Gradient background */}
      <div className='absolute inset-0 gradient-sunrise'></div>

      {/* Decorative elements */}
      <div className='absolute top-10 right-10 w-72 h-72 bg-white dark:bg-white/15 rounded-full mix-blend-overlay filter blur-3xl opacity-20 dark:opacity-10 animate-float'></div>
      <div
        className='absolute bottom-10 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-500/25 rounded-full mix-blend-overlay filter blur-3xl opacity-30 dark:opacity-15 animate-float'
        style={{ animationDelay: '1.5s' }}
      ></div>

      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='rounded-3xl p-12 md:p-16'>
            <h2 className='text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-lg'>
              Ready to level up your podcast post-production?
            </h2>
            <p className='text-xl md:text-2xl text-white mb-10 leading-relaxed drop-shadow-md'>
              Upload your podcast episode and watch the effects happen within
              moments.
            </p>
            {isAuthenticated ? (
              <Link href='/dashboard/upload'>
                <Button
                  size='lg'
                  className='bg-white text-blue-500/90 hover:bg-white/90 hover-glow text-lg px-10 py-7 rounded-xl shadow-2xl font-bold dark:bg-slate-50 dark:text-blue-600'
                >
                  <Upload className='mr-2 h-6 w-6' />
                  <p className='hidden md:inline'>
                    Upload Your Podcast Episode
                  </p>
                  <p className='inline md:hidden'>Upload Your Podcast</p>
                </Button>
              </Link>
            ) : (
              <SignInButton mode='modal'>
                <Button
                  size='lg'
                  className='bg-white text-blue-500/90 hover:bg-white/90 hover-glow text-lg px-10 py-7 rounded-xl shadow-2xl font-bold dark:bg-slate-50 dark:text-blue-600'
                >
                  Get Started Now
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
