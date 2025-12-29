// Integration tests for mocked AI generation using Vitest.
// Strategy: run the same step functions used in the pipeline with mock step tools.
// The provider layer is mocked, but the step wiring and parsing stay real.
// We compare results against deterministic fixtures to validate transformations.
// Failures indicate a mismatch between fixtures, schemas, or step logic.
import { describe, expect, it } from 'vitest';
import { generateHashtags } from '@/inngest/steps/ai-generation/hashtags';
import { generateRecaps } from '@/inngest/steps/ai-generation/recaps';
import { generateSocialPosts } from '@/inngest/steps/ai-generation/social-posts';
import { generateTitles } from '@/inngest/steps/ai-generation/titles';
import { generateYouTubeTimestamps } from '@/inngest/steps/ai-generation/youtube-timestamps';
import { createMockStep } from '@/lib/pipeline/step-tools';
import type { TranscriptWithExtras } from '@/lib/types';
import aiOutputsFixture from '@/tests/foundation/fixtures/ai_outputs.json';
import transcriptFixture from '@/tests/foundation/fixtures/transcript.json';

describe('mock ai generation', () => {
  const step = createMockStep();
  const transcript = transcriptFixture as TranscriptWithExtras;

  // Confirms the recaps step returns the mocked, structured output.
  // This keeps the recap feature deterministic under MOCK_AI.
  it('returns deterministic recaps output', async () => {
    const result = await generateRecaps(step, transcript);
    expect(result).toEqual(aiOutputsFixture.recaps);
  });

  // Validates the social posts step uses the mocked outputs.
  // This protects multi-post rendering from schema drift.
  it('returns deterministic social posts output', async () => {
    const result = await generateSocialPosts(step, transcript);
    expect(result).toEqual(aiOutputsFixture.social_posts);
  });

  // Ensures title generation stays deterministic for tests and demos.
  // Titles are used across the dashboard and export flows.
  it('returns deterministic titles output', async () => {
    const result = await generateTitles(step, transcript);
    expect(result).toEqual(aiOutputsFixture.titles);
  });

  // Verifies hashtag generation matches the fixture payload.
  // This keeps tag output stable for UI and integrations.
  it('returns deterministic hashtags output', async () => {
    const result = await generateHashtags(step, transcript);
    expect(result).toEqual(aiOutputsFixture.hashtags);
  });

  // Checks YouTube timestamps stay consistent with fixture data.
  // This aligns the video export view with mocked providers.
  it('returns deterministic youtube timestamps output', async () => {
    const result = await generateYouTubeTimestamps(step, transcript);
    expect(result).toEqual(aiOutputsFixture.youtube_timestamps);
  });
});
