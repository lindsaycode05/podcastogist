// Unit tests for plan gating config and helpers using Vitest.
// Strategy: validate static limits and feature access rules in isolation.
// These tests read exported constants and pure functions, with no network or mocks.
// Coverage focuses on plan limits, plan-to-feature access, and feature-to-job mapping.
// This protects pricing logic and upsell flows from accidental drift.
// Failures here indicate a product contract change, not an integration issue.
import { describe, expect, it } from 'vitest';
import {
  FEATURE_TO_JOB_MAP,
  FEATURES,
  PLAN_LIMITS,
  PODCASTOGIST_USER_PLANS
} from '@/lib/tier-config';
import {
  getMinimumPlanForFeature,
  planHasFeature
} from '@/lib/utils/tier-utils';

describe('plan limits and gating', () => {
  // Verifies that file size and duration ceilings match product policy.
  // This prevents regressions in upload gating for each plan tier.
  it('keeps plan limits aligned with product constraints', () => {
    expect(PLAN_LIMITS.free.maxFileSize).toBe(10 * 1024 * 1024);
    expect(PLAN_LIMITS.plus.maxFileSize).toBe(200 * 1024 * 1024);
    expect(PLAN_LIMITS.max.maxFileSize).toBe(3 * 1024 * 1024 * 1024);
    expect(PLAN_LIMITS.free.maxDuration).toBe(600);
    expect(PLAN_LIMITS.plus.maxDuration).toBe(7200);
    expect(PLAN_LIMITS.max.maxDuration).toBeNull();
  });

  // Asserts which features are accessible on each plan.
  // This catches any accidental widening or narrowing of entitlements.
  it('enforces feature gating by plan', () => {
    expect(planHasFeature(PODCASTOGIST_USER_PLANS.FREE, FEATURES.RECAPS)).toBe(
      true
    );
    expect(
      planHasFeature(PODCASTOGIST_USER_PLANS.FREE, FEATURES.SOCIAL_POSTS)
    ).toBe(false);
    expect(
      planHasFeature(PODCASTOGIST_USER_PLANS.PLUS, FEATURES.HASHTAGS)
    ).toBe(true);
    expect(
      planHasFeature(PODCASTOGIST_USER_PLANS.PLUS, FEATURES.YOUTUBE_TIMESTAMPS)
    ).toBe(false);
    expect(
      planHasFeature(PODCASTOGIST_USER_PLANS.MAX, FEATURES.HIGHLIGHT_MOMENTS)
    ).toBe(true);
  });

  // Validates the minimum plan required per feature and the job mapping used by the pipeline.
  // These mappings are used to decide what work to run for a user.
  it('maps features to minimum plan and job names', () => {
    expect(getMinimumPlanForFeature(FEATURES.RECAPS)).toBe(
      PODCASTOGIST_USER_PLANS.FREE
    );
    expect(getMinimumPlanForFeature(FEATURES.TITLES)).toBe(
      PODCASTOGIST_USER_PLANS.PLUS
    );
    expect(getMinimumPlanForFeature(FEATURES.HIGHLIGHT_MOMENTS)).toBe(
      PODCASTOGIST_USER_PLANS.MAX
    );
    expect(FEATURE_TO_JOB_MAP[FEATURES.RECAPS]).toBe('recaps');
    expect(FEATURE_TO_JOB_MAP[FEATURES.YOUTUBE_TIMESTAMPS]).toBe(
      'youtubeTimestamps'
    );
  });
});
