/**
 * Retry Job Function - Retries Individual Failed Generation Steps
 *
 * Triggered when user clicks retry button on a failed tab.
 * Regenerates just that specific output without reprocessing everything.
 * Supports upgrade scenarios - if user upgraded, can generate newly-unlocked features.
 */

import { PODCAST_RETRY_JOB_EVENT } from '@/lib/events';
import {
  type RetryJobEvent,
  runRetryJobPipeline
} from '@/lib/pipeline/retry-job-core';
import { inngest } from '../client';

const FUNCTION_NAME = 'retry-job';

const isRetryJobEvent = (event: { data?: unknown }): event is RetryJobEvent => {
  if (!event.data || typeof event.data !== 'object') return false;
  const data = event.data as Record<string, unknown>;
  return typeof data.projectId === 'string' && typeof data.job === 'string';
};

export const retryJob = inngest.createFunction(
  { id: FUNCTION_NAME },
  { event: PODCAST_RETRY_JOB_EVENT },
  async ({ event, step }) => {
    if (!isRetryJobEvent(event)) {
      throw new Error('Invalid podcast/retry-job event payload');
    }

    return runRetryJobPipeline({ event, step });
  }
);
