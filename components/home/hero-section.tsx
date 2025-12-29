import { MicVocal } from 'lucide-react';
import Link from 'next/link';
import { SignInButton } from '@/components/auth/auth-client';
import { Button } from '@/components/ui/button';
import { PodcastUploader } from '@/components/upload/podcast-uploader';
import { auth } from '@/lib/auth';

export const HeroSection = async () => {
  const { isAuthenticated } = await auth();

  return (
    <section className='relative overflow-hidden mesh-background'>
      <div className='container mx-auto px-4 py-24 md:pb-32 md:pt-20'>
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-20 animate-float'>
            <div className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card hover-glow mb-8 animate-shimmer'>
              <MicVocal className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              <span className='text-sm font-semibold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent'>
                AI-Powered Podcast Post-Production
              </span>
            </div>

            <h1 className='text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight'>
              <span className='gradient-sunrise-text'>Level Up</span> Your
              <br />
              Podcasts with AI
            </h1>

            <p className='text-xl md:text-2xl text-gray-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed'>
              Upload your episode audio and get AI-created summaries,
              transcripts, social content, highlight moments, and more - all in
              just moments.
            </p>
          </div>

          {isAuthenticated ? (
            <div className='space-y-6'>
              <div className='glass-card-strong rounded-2xl p-8 hover-lift'>
                <PodcastUploader />
              </div>
              <div className='text-center'>
                <Link href='/dashboard/projects'>
                  <Button
                    variant='outline'
                    size='lg'
                    className='hover-glow bg-white dark:bg-slate-900/80 dark:text-slate-100 dark:border-slate-700'
                  >
                    View All Projects
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <SignInButton mode='modal'>
                <Button
                  size='lg'
                  className='gradient-sunrise text-white hover-glow text-lg px-8 py-6 rounded-xl shadow-lg'
                >
                  Get Started
                </Button>
              </SignInButton>
              <Link href='/dashboard/projects'>
                <Button
                  size='lg'
                  variant='outline'
                  className='hover-glow text-lg px-8 py-6 rounded-xl bg-white dark:bg-slate-900/80 dark:text-slate-100 dark:border-slate-700'
                >
                  View Projects
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Decorative gradient orbs */}
      <div className='absolute top-0 right-0 w-96 h-96 bg-blue-300 dark:bg-blue-500/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-15 animate-float'></div>
      <div
        className='absolute bottom-0 left-0 w-96 h-96 bg-orange-300 dark:bg-orange-500/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-15 animate-float -z-1'
        style={{ animationDelay: '1s' }}
      ></div>
    </section>
  );
};
