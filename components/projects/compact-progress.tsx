'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { Doc } from '@/convex/_generated/dataModel';
import {
  PROGRESS_CAP_PERCENTAGE,
  PROGRESS_UPDATE_INTERVAL_MS
} from '@/lib/constants';
import { estimateAssemblyAITime } from '@/lib/processing-time-estimator';

interface CompactProgressProps {
  jobStatus: Doc<'projects'>['jobStatus'];
  fileDuration?: number;
  createdAt: number;
}

export const CompactProgress = ({
  jobStatus,
  fileDuration,
  createdAt
}: CompactProgressProps) => {
  const [progress, setProgress] = useState(0);
  const isTranscribing = jobStatus?.transcription === 'running';

  // biome-ignore lint: transcribtion status change should move the progress calculation forward
  useEffect(() => {
    // Calculate progress based on elapsed time vs estimated completion time
    const updateProgress = () => {
      const estimate = estimateAssemblyAITime(fileDuration);
      const elapsed = Math.floor((Date.now() - createdAt) / 1000);
      const calculatedProgress = (elapsed / estimate.conservative) * 100;
      setProgress(Math.min(PROGRESS_CAP_PERCENTAGE, calculatedProgress));
    };

    updateProgress();
    const interval = setInterval(updateProgress, PROGRESS_UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isTranscribing, createdAt, fileDuration]);

  const statusText = isTranscribing
    ? 'Transcribing...'
    : 'Generating content...';

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <Badge className='text-xs font-semibold bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40'>
          {statusText}
        </Badge>
        <span className='text-xs font-bold text-blue-600 dark:text-blue-300'>
          {Math.round(progress)}%
        </span>
      </div>
      <div className='relative h-2 bg-blue-100 dark:bg-blue-500/20 rounded-full overflow-hidden'>
        <div
          className='absolute inset-y-0 left-0 progress-sunrise rounded-full transition-all duration-300'
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
