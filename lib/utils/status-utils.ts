/**
 * Centralized status utilities for project status
 */

import {
  CheckCircle2,
  Clock,
  Loader2,
  type LucideIcon,
  XCircle
} from 'lucide-react';
import type { Doc } from '@/convex/_generated/dataModel';
import { capitalize } from './utils';

export type ProjectStatus = Doc<'projects'>['status'];
export type JobStatus = Doc<'projects'>['jobStatus'];

export const getStatusVariant = (
  status: ProjectStatus
): 'default' | 'secondary' | 'destructive' => {
  switch (status) {
    case 'uploaded':
      return 'default';
    case 'processing':
      return 'secondary';
    case 'completed':
      return 'default';
    case 'failed':
      return 'destructive';
  }
};

export const getStatusIcon = (status: ProjectStatus): LucideIcon => {
  switch (status) {
    case 'uploaded':
      return Clock;
    case 'processing':
      return Loader2;
    case 'completed':
      return CheckCircle2;
    case 'failed':
      return XCircle;
  }
};

/**
 * Get human-readable processing phase label for UI display
 *
 * @param project - Project document with status and jobStatus
 * @returns User-friendly label for the current phase
 */
export const getProcessingPhaseLabel = (project: Doc<'projects'>): string => {
  if (project.status !== 'processing') return capitalize(project.status);

  if (project.jobStatus?.transcription === 'running') {
    return 'Transcribing';
  }

  return 'Generating';
};
