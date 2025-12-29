// Test-only Zod schemas for event payload contracts.
// Used by integration tests to validate event shapes without runtime coupling.
import { z } from 'zod';

// Shared plan enum for event payloads.
export const planSchema = z.enum(['free', 'plus', 'max']);

// Event contract: podcast/uploaded
export const podcastUploadedEventSchema = z.object({
  name: z.literal('podcast/uploaded'),
  data: z.object({
    projectId: z.string(),
    userId: z.string(),
    plan: planSchema,
    fileUrl: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    mimeType: z.string()
  })
});

// Event contract: podcast/retry-job
export const podcastRetryJobEventSchema = z.object({
  name: z.literal('podcast/retry-job'),
  data: z.object({
    projectId: z.string(),
    job: z.enum([
      'socialPosts',
      'titles',
      'hashtags',
      'highlightMoments',
      'youtubeTimestamps',
      'recaps'
    ]),
    userId: z.string(),
    originalPlan: planSchema,
    currentPlan: planSchema
  })
});

// Event contract: assemblyai/transcript.status
export const assemblyAITranscriptStatusEventSchema = z.object({
  name: z.literal('assemblyai/transcript.status'),
  data: z.object({
    projectId: z.string(),
    transcriptId: z.string(),
    status: z.enum(['completed', 'error']),
    error: z.string().optional()
  })
});
