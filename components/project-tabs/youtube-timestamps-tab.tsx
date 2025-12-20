'use client';

import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard';
import { Check, Copy } from 'lucide-react';

type YouTubeTimestamp = {
  timestamp: string;
  description: string;
};

type YouTubeTimestampsTabProps = {
  timestamps?: YouTubeTimestamp[];
};

export const YouTubeTimestampsTab = ({
  timestamps,
}: YouTubeTimestampsTabProps) => {
  const { copy, isCopied } = useCopyToClipboard();

  // TabContent ensures this is never undefined at runtime
  if (!timestamps) return null;

  const formattedTimestamps = timestamps
    .map((t) => `${t.timestamp} ${t.description}`)
    .join('\n');

  const handleCopyAll = () => {
    copy(
      formattedTimestamps,
      'youtube-timestamps',
      'Timestamps copied to clipboard!'
    );
  };

  return (
    <div className='glass-card rounded-2xl p-6 md:p-8'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4'>
        <div>
          <h3 className='text-xl md:text-2xl font-bold gradient-sunrise-text mb-2'>
            YouTube Timestamps & Chapters
          </h3>
          <p className='text-sm text-gray-600 dark:text-slate-300'>
            Copy these timestamps and paste them into your YouTube video
            description. YouTube will automatically create clickable chapter
            markers.
          </p>
        </div>
        <Button
          onClick={handleCopyAll}
          className='gradient-sunrise text-white hover-glow shadow-lg gap-2 shrink-0'
        >
          {isCopied('youtube-timestamps') ? (
            <>
              <Check className='h-4 w-4' />
              Copied!
            </>
          ) : (
            <>
              <Copy className='h-4 w-4' />
              Copy All
            </>
          )}
        </Button>
      </div>

      <div className='space-y-6'>
        <div className='glass-card rounded-xl p-4 md:p-5 bg-linear-to-br from-blue-50 to-orange-50 dark:from-blue-950/50 dark:to-orange-950/40 border border-blue-100 dark:border-blue-500/30'>
          <pre className='whitespace-pre-wrap font-mono text-xs md:text-sm wrap-break-word text-gray-800 dark:text-slate-100'>
            {formattedTimestamps}
          </pre>
        </div>

        <div className='space-y-4 pt-4 border-t border-gray-200 dark:border-slate-700'>
          <h4 className='text-base md:text-lg font-bold text-gray-900 dark:text-slate-100'>
            Individual Timestamps:
          </h4>
          <div className='space-y-3'>
            {timestamps.map((timestamp) => (
              <div
                key={`${timestamp.timestamp}-${timestamp.description.substring(
                  0,
                  20
                )}`}
                className='flex items-start gap-3 md:gap-4 p-4 md:p-5 glass-card rounded-xl border-l-4 border-l-blue-400 dark:border-l-blue-500/60'
              >
                <code className='text-sm md:text-base font-mono font-bold gradient-sunrise text-white px-3 py-1.5 rounded-lg shadow-md shrink-0'>
                  {timestamp.timestamp}
                </code>
                <p className='text-sm md:text-base text-gray-700 dark:text-slate-200 flex-1 min-w-0 wrap-break-word leading-relaxed'>
                  {timestamp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
