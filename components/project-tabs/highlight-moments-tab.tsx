'use client';

import { Badge } from '@/components/ui/badge';

interface HighlightMomentsTabProps {
  highlightMoments?: {
    time: string;
    text: string;
    description: string;
  }[];
}

export const HighlightMomentsTab = ({
  highlightMoments
}: HighlightMomentsTabProps) => {
  // TabContent ensures this is never undefined at runtime
  if (!highlightMoments) return null;

  return (
    <div className='glass-card rounded-2xl p-8'>
      <h3 className='text-2xl font-bold mb-8 gradient-sunrise-text'>
        Highlight Moments
      </h3>
      <div className='space-y-6'>
        {highlightMoments.map((moment, idx) => (
          <div
            key={`${idx}-${moment.time}`}
            className='flex items-start gap-4 md:gap-6 p-4 md:p-6 glass-card rounded-xl border-l-4 border-l-blue-400 dark:border-l-blue-500/60'
          >
            <Badge className='mt-1 gradient-sunrise text-white px-3 py-2 text-sm md:text-base font-bold shadow-md shrink-0'>
              {moment.time}
            </Badge>
            <div className='flex-1 min-w-0'>
              <p className='font-bold text-base md:text-lg text-gray-900 dark:text-slate-100 mb-2 wrap-break-word'>
                {moment.text}
              </p>
              <p className='text-sm md:text-base text-gray-600 dark:text-slate-300 leading-relaxed wrap-break-word'>
                {moment.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
