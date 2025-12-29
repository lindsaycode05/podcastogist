'use client';

import { ChevronDown, FileText, MicVocal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/auth-client';
import { GenerationOutputItem } from '@/components/processing-flow/generation-output-item';
import { PhaseCard } from '@/components/processing-flow/phase-card';
import { Badge } from '@/components/ui/badge';
import {
  ANIMATION_INTERVAL_MS,
  GENERATION_OUTPUTS,
  PODCAST_PROCESSING_PHASE_STATUS,
  PROGRESS_CAP_PERCENTAGE
} from '@/lib/constants';
import {
  estimateAssemblyAITime,
  formatTimeRange
} from '@/lib/processing-time-estimator';
import {
  FEATURES,
  type FeatureName,
  PLAN_FEATURES,
  PODCASTOGIST_USER_PLANS
} from '@/lib/tier-config';
import type { PhaseStatus } from '@/lib/types';
import { getMinimumPlanForFeature } from '@/lib/utils/tier-utils';

interface ProcessingFlowProps {
  transcriptionStatus: PhaseStatus;
  generationStatus: PhaseStatus;
  fileDuration?: number;
  createdAt: number;
}

export const ProcessingFlow = ({
  transcriptionStatus,
  generationStatus,
  fileDuration,
  createdAt
}: ProcessingFlowProps) => {
  // Get user's current plan from Clerk
  const { has } = useAuth();

  // Determine user's plan using Clerk's has() method
  const userPlan = useMemo(() => {
    if (has?.({ plan: PODCASTOGIST_USER_PLANS.MAX }))
      return PODCASTOGIST_USER_PLANS.MAX;
    if (has?.({ plan: PODCASTOGIST_USER_PLANS.PLUS }))
      return PODCASTOGIST_USER_PLANS.PLUS;
    return PODCASTOGIST_USER_PLANS.FREE;
  }, [has]);

  const isTranscribing =
    transcriptionStatus === PODCAST_PROCESSING_PHASE_STATUS.RUNNING;
  const transcriptionComplete =
    transcriptionStatus === PODCAST_PROCESSING_PHASE_STATUS.COMPLETED;
  const transcriptionInProgress =
    transcriptionStatus === PODCAST_PROCESSING_PHASE_STATUS.PENDING ||
    transcriptionStatus === PODCAST_PROCESSING_PHASE_STATUS.RUNNING;
  const isGenerating =
    generationStatus === PODCAST_PROCESSING_PHASE_STATUS.RUNNING;
  const generationComplete =
    generationStatus === PODCAST_PROCESSING_PHASE_STATUS.COMPLETED;

  // Get features available for user's plan
  const availableFeatures = useMemo(() => PLAN_FEATURES[userPlan], [userPlan]);

  // Process all outputs and mark which are locked
  const processedOutputs = useMemo(() => {
    // Map generation outputs to feature keys (properly typed)
    const outputToFeature: Record<string, FeatureName> = {
      Recaps: FEATURES.RECAPS,
      'Highlight Moments': FEATURES.HIGHLIGHT_MOMENTS,
      'Social Posts': FEATURES.SOCIAL_POSTS,
      Titles: FEATURES.TITLES,
      Hashtags: FEATURES.HASHTAGS,
      'YouTube Timestamps': FEATURES.YOUTUBE_TIMESTAMPS
    };

    return GENERATION_OUTPUTS.map((output) => {
      const featureKey = outputToFeature[output.name];
      const isLocked = featureKey
        ? !availableFeatures.includes(featureKey)
        : false;
      const requiredPlan = isLocked
        ? getMinimumPlanForFeature(featureKey)
        : null;

      return {
        ...output,
        isLocked,
        requiredPlan
      };
    });
  }, [availableFeatures]);

  // Only unlocked outputs cycle through animation
  const unlockedOutputs = useMemo(
    () => processedOutputs.filter((o) => !o.isLocked),
    [processedOutputs]
  );

  // Memoize expensive calculations
  const timeEstimate = useMemo(
    () => estimateAssemblyAITime(fileDuration),
    [fileDuration]
  );

  const timeRangeText = useMemo(
    () => formatTimeRange(timeEstimate.bestCase, timeEstimate.conservative),
    [timeEstimate.bestCase, timeEstimate.conservative]
  );

  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [currentOutputIndex, setCurrentOutputIndex] = useState(0);

  useEffect(() => {
    if (!isTranscribing) {
      setTranscriptionProgress(0);
      return;
    }

    const updateProgress = () => {
      const elapsedSeconds = Math.floor((Date.now() - createdAt) / 1000);
      const progress = (elapsedSeconds / timeEstimate.conservative) * 100;
      setTranscriptionProgress(Math.min(PROGRESS_CAP_PERCENTAGE, progress));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [isTranscribing, createdAt, timeEstimate.conservative]);

  useEffect(() => {
    if (!isGenerating || unlockedOutputs.length === 0) {
      setCurrentOutputIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentOutputIndex((prev) => (prev + 1) % unlockedOutputs.length);
    }, ANIMATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isGenerating, unlockedOutputs.length]);

  const getTranscriptionDescription = useCallback(() => {
    if (isTranscribing) return 'AI is processing your podcast episode...';
    if (transcriptionComplete) return 'Analysis finished!';
    return 'Getting your analysis ready...';
  }, [isTranscribing, transcriptionComplete]);

  const getGenerationDescription = useCallback(() => {
    if (!transcriptionComplete) return 'Waiting for analysis to finish...';
    const unlockedCount = unlockedOutputs.length;
    if (isGenerating)
      return `Creating ${unlockedCount} AI output${
        unlockedCount !== 1 ? 's' : ''
      }${unlockedCount > 1 ? ' in parallel' : ''}...`;
    if (generationComplete) return 'Everything has been generated!';
    return 'Preparing to generate content...';
  }, [
    transcriptionComplete,
    isGenerating,
    generationComplete,
    unlockedOutputs.length
  ]);

  return (
    <div className='space-y-6'>
      <PhaseCard
        icon={FileText}
        title='Phase 1: AI Analysis'
        description={getTranscriptionDescription()}
        status={transcriptionStatus}
        isActive={isTranscribing}
        progress={isTranscribing ? transcriptionProgress : undefined}
        timeEstimate={transcriptionInProgress ? timeRangeText : undefined}
      />

      <div className='flex items-center justify-center'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <div className='h-px w-16 bg-border' />
          <ChevronDown className='h-5 w-5' />
          <div className='h-px w-16 bg-border' />
        </div>
      </div>

      <PhaseCard
        icon={MicVocal}
        title='Phase 2: AI Generation'
        description={getGenerationDescription()}
        status={generationStatus}
        isActive={isGenerating}
      >
        {isGenerating && (
          <div className='space-y-3 pt-2'>
            {unlockedOutputs.map((output, idx) => {
              const isActive = idx === currentOutputIndex;

              return (
                <GenerationOutputItem
                  key={output.name}
                  name={output.name}
                  description={output.description}
                  icon={output.icon}
                  isActive={isActive}
                />
              );
            })}

            <div className='bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-950/50 dark:to-orange-950/40 rounded-2xl p-6 text-center mt-6 border-2 border-blue-200 dark:border-blue-500/30 shadow-lg'>
              <p className='text-sm text-gray-700 dark:text-slate-200 leading-relaxed'>
                <span className='font-bold text-blue-600 dark:text-blue-300 text-base'>
                  Results available soon!
                </span>{' '}
                — AI is generating {unlockedOutputs.length} output
                {unlockedOutputs.length > 1 ? 's' : ''}
                {unlockedOutputs.length > 1 ? ' simultaneously' : ''}
              </p>
            </div>
          </div>
        )}

        {generationComplete && (
          <div className='flex flex-wrap items-center gap-3 pt-4'>
            {unlockedOutputs.map((output) => (
              <Badge
                key={output.name}
                className='text-sm px-4 py-2 gradient-sunrise text-white shadow-md'
              >
                {output.name}
              </Badge>
            ))}
          </div>
        )}
      </PhaseCard>
    </div>
  );
};
