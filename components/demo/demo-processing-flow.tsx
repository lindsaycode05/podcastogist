'use client';

import { ChevronDown, FileText, MicVocal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GenerationOutputItem } from '@/components/processing-flow/generation-output-item';
import { PhaseCard } from '@/components/processing-flow/phase-card';
import { Badge } from '@/components/ui/badge';
import {
  GENERATION_OUTPUTS,
  PODCAST_PROCESSING_PHASE_STATUS
} from '@/lib/constants';
import type { PhaseStatus } from '@/lib/types';

const ANALYSIS_DURATION_MS = 6000;
const GENERATION_DURATION_MS = 8800;
const PROGRESS_UPDATE_MS = 55;
const COMPLETE_REVEAL_DELAY_MS = 1130;

const DEMO_PHASES = {
  ANALYSIS: 'analysis',
  GENERATION: 'generation',
  COMPLETE: 'complete'
} as const;

type DemoPhase = (typeof DEMO_PHASES)[keyof typeof DEMO_PHASES];

interface DemoProcessingFlowProps {
  onComplete?: () => void;
}

export const DemoProcessingFlow = ({ onComplete }: DemoProcessingFlowProps) => {
  const [phase, setPhase] = useState<DemoPhase>(DEMO_PHASES.ANALYSIS);
  const [progress, setProgress] = useState(0);
  const [currentOutputIndex, setCurrentOutputIndex] = useState(0);

  useEffect(() => {
    if (phase !== DEMO_PHASES.ANALYSIS) return;

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const nextProgress = Math.min(
        100,
        (elapsed / ANALYSIS_DURATION_MS) * 100
      );
      setProgress(nextProgress);

      if (elapsed >= ANALYSIS_DURATION_MS) {
        clearInterval(interval);
        setProgress(100);
        setPhase(DEMO_PHASES.GENERATION);
      }
    }, PROGRESS_UPDATE_MS);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== DEMO_PHASES.GENERATION) return;

    const cycleCount = Math.max(1, Math.round(GENERATION_OUTPUTS.length * 1.5));
    const intervalMs = Math.max(
      700,
      Math.floor(GENERATION_DURATION_MS / cycleCount)
    );

    const interval = setInterval(() => {
      setCurrentOutputIndex((prev) => (prev + 1) % GENERATION_OUTPUTS.length);
    }, intervalMs);

    const doneTimer = setTimeout(() => {
      setPhase(DEMO_PHASES.COMPLETE);
      if (onComplete) {
        setTimeout(onComplete, COMPLETE_REVEAL_DELAY_MS);
      }
    }, GENERATION_DURATION_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(doneTimer);
    };
  }, [phase, onComplete]);

  const transcriptionStatus: PhaseStatus =
    phase === DEMO_PHASES.ANALYSIS
      ? PODCAST_PROCESSING_PHASE_STATUS.RUNNING
      : PODCAST_PROCESSING_PHASE_STATUS.COMPLETED;
  const generationStatus: PhaseStatus =
    phase === DEMO_PHASES.ANALYSIS
      ? PODCAST_PROCESSING_PHASE_STATUS.PENDING
      : phase === DEMO_PHASES.GENERATION
        ? PODCAST_PROCESSING_PHASE_STATUS.RUNNING
        : PODCAST_PROCESSING_PHASE_STATUS.COMPLETED;

  const transcriptionDescription = useMemo(() => {
    if (phase === DEMO_PHASES.ANALYSIS)
      return 'AI is processing this podcast episode...';
    return 'Analysis finished!';
  }, [phase]);

  const generationDescription = useMemo(() => {
    if (phase === DEMO_PHASES.ANALYSIS)
      return 'Waiting for analysis to finish...';
    if (phase === DEMO_PHASES.GENERATION)
      return `Creating ${GENERATION_OUTPUTS.length} AI outputs in parallel...`;
    return 'Everything has been generated!';
  }, [phase]);

  const isTranscribing = phase === DEMO_PHASES.ANALYSIS;
  const isGenerating = phase === DEMO_PHASES.GENERATION;
  const generationComplete = phase === DEMO_PHASES.COMPLETE;

  return (
    <div className='space-y-6'>
      <PhaseCard
        icon={FileText}
        title='Phase 1: AI Analysis'
        description={transcriptionDescription}
        status={transcriptionStatus}
        isActive={isTranscribing}
        progress={isTranscribing ? progress : undefined}
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
        description={generationDescription}
        status={generationStatus}
        isActive={isGenerating}
      >
        {isGenerating && (
          <div className='space-y-3 pt-2'>
            {GENERATION_OUTPUTS.map((output, idx) => {
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
                — AI is generating 6 outputs simultaneously
              </p>
            </div>
          </div>
        )}

        {generationComplete && (
          <div className='flex flex-wrap items-center gap-3 pt-4'>
            {GENERATION_OUTPUTS.map((output) => (
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
