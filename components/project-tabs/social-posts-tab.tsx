'use client';

import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard';
import { Check, Copy } from 'lucide-react';
import { SocialIcon } from 'react-social-icons';

interface SocialPostsTabProps {
  socialPosts?: {
    twitter: string;
    linkedin: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    facebook: string;
  };
}

const PLATFORMS = [
  {
    key: 'twitter' as const,
    title: 'Twitter / X',
    url: 'https://twitter.com',
    bgColor: 'bg-black/5 dark:bg-white/5',
    hoverColor: 'hover:bg-black/10'
  },
  {
    key: 'linkedin' as const,
    title: 'LinkedIn',
    url: 'https://linkedin.com',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    hoverColor: 'hover:bg-blue-100'
  },
  {
    key: 'instagram' as const,
    title: 'Instagram',
    url: 'https://instagram.com',
    bgColor: 'bg-pink-50 dark:bg-pink-500/10',
    hoverColor: 'hover:bg-pink-100'
  },
  {
    key: 'tiktok' as const,
    title: 'TikTok',
    url: 'https://tiktok.com',
    bgColor: 'bg-slate-50 dark:bg-slate-800/60',
    hoverColor: 'hover:bg-slate-100'
  },
  {
    key: 'youtube' as const,
    title: 'YouTube',
    url: 'https://youtube.com',
    bgColor: 'bg-red-50 dark:bg-red-500/10',
    hoverColor: 'hover:bg-red-100'
  },
  {
    key: 'facebook' as const,
    title: 'Facebook',
    url: 'https://facebook.com',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    hoverColor: 'hover:bg-blue-100'
  }
];

export const SocialPostsTab = ({ socialPosts }: SocialPostsTabProps) => {
  const { copy, isCopied } = useCopyToClipboard();

  // TabContent ensures this is never undefined at runtime
  if (!socialPosts) return null;

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      {PLATFORMS.map((platform) => (
        <div
          key={platform.key}
          className={`glass-card rounded-2xl p-4 md:p-6 ${platform.bgColor}`}
        >
          {/* Header with Icon and Title */}
          <div className='flex items-start gap-3 md:gap-5 mb-4 md:mb-6'>
            <div className='shrink-0'>
              <SocialIcon
                url={platform.url}
                style={{ height: 48, width: 48 }}
                className='md:h-14 md:w-14'
              />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='font-bold text-base md:text-xl mb-1 wrap-break-word'>
                {platform.title}
              </h3>
              <p className='text-xs md:text-sm text-gray-600 dark:text-slate-300'>
                Ready to post
              </p>
            </div>
            <Button
              size='sm'
              onClick={() =>
                copy(
                  socialPosts[platform.key],
                  platform.key,
                  `${platform.title} post copied to clipboard!`
                )
              }
              className='shrink-0 gradient-sunrise text-white shadow-md text-xs md:text-sm'
            >
              {isCopied(platform.key) ? (
                <>
                  <Check className='h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2' />
                  Copied
                </>
              ) : (
                <>
                  <Copy className='h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2' />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Post Content */}
          <div className='relative'>
            <div className='rounded-xl bg-white dark:bg-slate-900/80 p-4 md:p-5 text-xs md:text-sm border-2 dark:border-slate-700 shadow-sm'>
              <p className='whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-slate-200 wrap-break-word'>
                {socialPosts[platform.key]}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
