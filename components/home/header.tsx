'use client';

import { Protect, SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import { ArrowBigUpDash, Home, MicVocal, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeaderRoutes } from '@/components/home/header-routes';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PODCASTOGIST_USER_PLANS } from '@/lib/tier-config';

export const Header = () => {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const showHeaderRoutes = isDashboard;

  return (
    <header
      className={
        isDashboard
          ? 'gradient-sunrise sticky top-0 transition-all shadow-xl backdrop-blur-sm z-50 border-b border-white/10'
          : 'glass-nav sticky top-0 transition-all z-50 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/60 shadow-sm'
      }
    >
      <div className='container mx-auto px-4 lg:px-6'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center gap-2 lg:gap-8'>
            <Link
              href='/'
              className='flex items-center gap-2.5 hover:opacity-90 transition-all duration-300 group'
            >
              <div
                className={
                  isDashboard
                    ? 'p-2 rounded-xl bg-white/95 group-hover:bg-white group-hover:scale-110 group-hover:shadow-xl transition-all duration-300'
                    : 'p-2 rounded-xl gradient-sunrise group-hover:scale-110 group-hover:shadow-xl transition-all duration-300'
                }
              >
                <MicVocal
                  className={
                    isDashboard
                      ? 'h-5 w-5 text-blue-600 group-hover:rotate-12 transition-transform duration-300'
                      : 'h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300'
                  }
                />
              </div>
              <span
                className={
                  isDashboard
                    ? 'hidden md:inline text-xl font-bold text-white tracking-tight'
                    : 'hidden md:inline text-xl font-bold gradient-sunrise-text tracking-tight'
                }
              >
                Podcastogist
              </span>
            </Link>

            {showHeaderRoutes && (
              <div className='flex items-center pl-2 sm:pl-4 border-l border-white/50'>
                <HeaderRoutes />
              </div>
            )}
          </div>

          <div className='flex items-center gap-2 lg:gap-3'>
            {isSignedIn ? (
              <>
                {/* Show "Upgrade to Plus" for Free users */}
                <Protect
                  condition={(has) =>
                    !has({ plan: PODCASTOGIST_USER_PLANS.PLUS }) &&
                    !has({ plan: PODCASTOGIST_USER_PLANS.MAX })
                  }
                  fallback={null}
                >
                  <Link href='/dashboard/upgrade'>
                    <Button
                      className={
                        isDashboard
                          ? 'bg-white/95 text-blue-600 hover:bg-white hover:scale-105 gap-2 shadow-lg font-semibold transition-all duration-300 border border-white/20 dark:bg-slate-900/70 dark:text-slate-100 dark:border-white/10 dark:hover:bg-slate-900/70'
                          : 'gradient-sunrise text-white hover-glow hover:scale-105 gap-2 shadow-lg transition-all duration-300'
                      }
                    >
                      <Plus className='hidden md:inline h-4 w-4' />
                      <span className='hidden lg:inline'>Upgrade to Plus</span>
                      <span className='lg:hidden'>Go Plus</span>
                    </Button>
                  </Link>
                </Protect>

                {/* Show "Upgrade to Max" for Plus users */}
                <Protect
                  condition={(has) =>
                    has({ plan: PODCASTOGIST_USER_PLANS.PLUS }) &&
                    !has({ plan: PODCASTOGIST_USER_PLANS.MAX })
                  }
                  fallback={null}
                >
                  <Link href='/dashboard/upgrade'>
                    <Button
                      className={
                        isDashboard
                          ? 'bg-white/95 text-blue-600 hover:bg-white hover:scale-105 gap-2 shadow-lg font-semibold transition-all duration-300 border border-white/20 dark:bg-slate-900/70 dark:text-slate-100 dark:border-white/10 dark:hover:bg-slate-900/70'
                          : 'gradient-sunrise text-white hover-glow hover:scale-105 gap-2 shadow-lg transition-all duration-300'
                      }
                    >
                      <ArrowBigUpDash className='hidden md:inline h-4 w-4' />
                      <span className='hidden lg:inline'>Upgrade to Max</span>
                      <span className='lg:hidden'>Go Max</span>
                    </Button>
                  </Link>
                </Protect>

                {/* Show Max badge for Max users */}
                <Protect
                  condition={(has) =>
                    has({ plan: PODCASTOGIST_USER_PLANS.MAX })
                  }
                  fallback={null}
                >
                  <Badge
                    className={
                      isDashboard
                        ? 'gap-1.5 flex bg-white/95 text-blue-600 border-0 px-3 py-1.5 shadow-md hover:shadow-lg transition-all duration-300 dark:bg-slate-900/70 dark:text-slate-100'
                        : 'gap-1.5 flex gradient-sunrise text-white border-0 px-3 py-1.5 shadow-md hover:shadow-lg transition-all duration-300'
                    }
                  >
                    <ArrowBigUpDash className='h-3.5 w-3.5' />
                    <span className='font-semibold'>Max</span>
                  </Badge>
                </Protect>

                {!showHeaderRoutes && (
                  <Link href='/dashboard/projects'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className={
                        isDashboard
                          ? 'hover-scale text-white hover:bg-white/20 transition-all duration-300'
                          : 'hover-scale transition-all duration-300'
                      }
                    >
                      <span className='hidden lg:inline'>My Projects</span>
                      <span className='lg:hidden'>Projects</span>
                    </Button>
                  </Link>
                )}
                {showHeaderRoutes && (
                  <Link href='/' className='hidden lg:block'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className={
                        isDashboard
                          ? 'gap-2 hover-scale text-white hover:bg-white/20 transition-all duration-300'
                          : 'gap-2 hover-scale transition-all duration-300'
                      }
                    >
                      <Home className='h-4 w-4' />
                      Home
                    </Button>
                  </Link>
                )}
                <ThemeToggle
                  className={
                    isDashboard
                      ? 'text-white hover:bg-white/20 hover:scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:scale-105 dark:text-slate-200 dark:hover:bg-white/10'
                  }
                />
                <div className='mt-1.5 scale-110 hover:scale-125 transition-transform duration-300'>
                  <UserButton afterSignOutUrl='/' />
                </div>
              </>
            ) : (
              <>
                <ThemeToggle
                  className={
                    isDashboard
                      ? 'text-white hover:bg-white/20 hover:scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:scale-105 dark:text-slate-200 dark:hover:bg-white/10'
                  }
                />
                <SignInButton mode='modal'>
                  <Button
                    className={
                      isDashboard
                        ? 'bg-white/95 text-blue-600 hover:bg-white hover:scale-105 shadow-lg font-semibold transition-all duration-300 dark:bg-slate-900/70 dark:text-slate-100'
                        : 'gradient-sunrise text-white hover-glow hover:scale-105 shadow-lg transition-all duration-300'
                    }
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
