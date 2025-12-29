// Integration tests for AI output schemas using Vitest and Zod parsing.
// Strategy: validate the real fixture payloads against the production schemas.
// This is a contract test between mocked providers and downstream UI/logic.
// We keep one canonical fixture set to avoid test-data drift.
// Failures indicate schema changes or fixture mismatch, not model behavior.
import { describe, expect, it } from 'vitest';
import {
  hashtagsSchema,
  recapsSchema,
  socialPostsSchema,
  titlesSchema
} from '@/schemas/ai-outputs';
import aiOutputsFixture from '@/tests/foundation/fixtures/ai_outputs.json';

describe('ai output schemas', () => {
  // Confirms recap payloads still satisfy the structured output contract.
  // This guards the core summary rendering path.
  it('validates recaps fixture against zod schema', () => {
    expect(() => recapsSchema.parse(aiOutputsFixture.recaps)).not.toThrow();
  });

  // Ensures social post payloads keep the required structure.
  // This protects the multi-post UI from shape regressions.
  it('validates social posts fixture against zod schema', () => {
    expect(() =>
      socialPostsSchema.parse(aiOutputsFixture.social_posts)
    ).not.toThrow();
  });

  // Checks title suggestions remain compatible with the schema.
  // Titles are used across multiple screens and exports.
  it('validates titles fixture against zod schema', () => {
    expect(() => titlesSchema.parse(aiOutputsFixture.titles)).not.toThrow();
  });

  // Verifies hashtag outputs match the expected contract.
  // This keeps tag lists stable for UI and exports.
  it('validates hashtags fixture against zod schema', () => {
    expect(() => hashtagsSchema.parse(aiOutputsFixture.hashtags)).not.toThrow();
  });
});
