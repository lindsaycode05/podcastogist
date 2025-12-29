import { inngest } from '@/inngest/client';
import { PODCAST_UPLOADED_EVENT } from '@/lib/events';
import {
  type PodcastUploadedEvent,
  runPodcastPipeline
} from '@/lib/pipeline/podcast-processor-core';

const FUNCTION_NAME = 'podcast-processor';

const isPodcastUploadedEvent = (event: {
  data?: unknown;
}): event is PodcastUploadedEvent => {
  if (!event.data || typeof event.data !== 'object') return false;
  const data = event.data as Record<string, unknown>;
  return typeof data.projectId === 'string' && typeof data.fileUrl === 'string';
};

export const podcastProcessor = inngest.createFunction(
  {
    id: FUNCTION_NAME,
    // Optimizes parallel step execution (important for the 6 parallel AI jobs)
    optimizeParallelism: true,
    // Retry configuration: 3 attempts with exponential backoff
    retries: 3
  },
  // Event trigger: sent by server action after upload
  { event: PODCAST_UPLOADED_EVENT },
  async ({ event, step }) => {
    if (!isPodcastUploadedEvent(event)) {
      throw new Error('Invalid podcast/uploaded event payload');
    }

    return runPodcastPipeline({ event, step });
  }
);
