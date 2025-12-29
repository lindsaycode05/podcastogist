// Integration tests for event contracts using Vitest and Zod schemas.
// Strategy: validate canonical payloads for the event-driven pipeline.
// These are contract tests for Inngest-style events without running workers.
// We assert required fields and names for upload, retry, and webhook events.
// Failures here indicate a breaking change to the event backbone.
import { describe, expect, it } from 'vitest';
import {
  assemblyAITranscriptStatusEventSchema,
  podcastRetryJobEventSchema,
  podcastUploadedEventSchema
} from '@/schemas/_tests_/events';

describe('event contracts', () => {
  // Ensures the podcast upload event includes all required metadata.
  // This is the entry point for the pipeline trigger.
  it('validates podcast/uploaded payload shape', () => {
    const payload = {
      name: 'podcast/uploaded',
      data: {
        projectId: 'projects:demo123',
        userId: 'user_test_1',
        plan: 'free',
        fileUrl: 'https://mock.blob.local/demo.mp3',
        fileName: 'demo.mp3',
        fileSize: 1024,
        mimeType: 'audio/mpeg'
      }
    };

    expect(() => podcastUploadedEventSchema.parse(payload)).not.toThrow();
  });

  // Verifies the retry event carries job and plan context for recovery flows.
  // This protects the retry pipeline from missing inputs.
  it('validates podcast/retry-job payload shape', () => {
    const payload = {
      name: 'podcast/retry-job',
      data: {
        projectId: 'projects:demo123',
        job: 'socialPosts',
        userId: 'user_test_1',
        originalPlan: 'free',
        currentPlan: 'plus'
      }
    };

    expect(() => podcastRetryJobEventSchema.parse(payload)).not.toThrow();
  });

  // Confirms transcript status webhooks map into the expected event contract.
  // This keeps transcription status updates deterministic for the pipeline.
  it('validates assemblyai/transcript.status payload shape', () => {
    const payload = {
      name: 'assemblyai/transcript.status',
      data: {
        projectId: 'projects:demo123',
        transcriptId: 'transcript_123',
        status: 'completed'
      }
    };

    expect(() =>
      assemblyAITranscriptStatusEventSchema.parse(payload)
    ).not.toThrow();
  });
});
