/**
 * Tier Configuration for Feature Gating
 *
 * Defines limits and features for each subscription plan (FREE/PLUS/MAX).
 * Used throughout the app to enforce plan-based restrictions.
 *
 * Reference: https://clerk.com/docs/nextjs/guides/billing/for-b2c
 */

export type PlanName = 'free' | 'plus' | 'max';

export interface PlanLimits {
  maxProjects: number | null; // null = unlimited
  maxFileSize: number; // bytes
  maxDuration: number | null; // seconds, null = unlimited
}

/**
 * Plan limits configuration
 * All size values are in bytes, durations in seconds
 */
export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    maxProjects: 3, // lifetime, including deleted
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxDuration: 600, // 10 minutes
  },
  plus: {
    maxProjects: 30, // active projects only
    maxFileSize: 200 * 1024 * 1024, // 200MB
    maxDuration: 7200, // 2 hours
  },
  max: {
    maxProjects: null, // unlimited
    maxFileSize: 3 * 1024 * 1024 * 1024, // 3GB
    maxDuration: null, // unlimited
  },
};

/**
 * Feature names corresponding to Clerk billing features
 * These should match the feature identifiers in Clerk Dashboard
 *
 * Note: Transcription is NOT a feature - it's core functionality available to all plans
 */
export const FEATURES = {
  SUMMARY: 'recaps',
  SOCIAL_POSTS: 'social_posts',
  TITLES: 'podcast_titles',
  HASHTAGS: 'hashtags',
  YOUTUBE_TIMESTAMPS: 'youtube_chapters',
  HIGHLIGHT_MOMENTS: 'highlight_moments',
  SPEAKER_DIARIZATION: 'full_transcript_speaker_recognition',
} as const;

export type FeatureName = (typeof FEATURES)[keyof typeof FEATURES];

/**
 * Features available to each plan
 * Maps plan names to their available features
 *
 * Note: Transcription is available to ALL plans as core functionality
 */
export const PLAN_FEATURES: Record<PlanName, FeatureName[]> = {
  free: [FEATURES.SUMMARY],
  plus: [
    FEATURES.SUMMARY,
    FEATURES.SOCIAL_POSTS,
    FEATURES.TITLES,
    FEATURES.HASHTAGS,
  ],
  max: [
    FEATURES.SUMMARY,
    FEATURES.SOCIAL_POSTS,
    FEATURES.TITLES,
    FEATURES.HASHTAGS,
    FEATURES.YOUTUBE_TIMESTAMPS,
    FEATURES.HIGHLIGHT_MOMENTS,
    FEATURES.SPEAKER_DIARIZATION,
  ],
};

/**
 * Human-readable plan names for UI display
 */
export const PODCASTOGIST_USER_PLANS: {
  FREE: PlanName;
  PLUS: PlanName;
  MAX: PlanName;
} = {
  FREE: 'free',
  PLUS: 'plus',
  MAX: 'max',
};

/**
 * Price information for upgrade messaging
 */
export const PLAN_PRICES: Record<PlanName, string> = {
  free: '$0',
  plus: '$21/month',
  max: '$34/month',
};

/**
 * Mapping from feature names to job names for retry/regeneration
 * Used to consolidate logic across actions and Inngest functions
 */
export const FEATURE_TO_JOB_MAP = {
  [FEATURES.SOCIAL_POSTS]: 'socialPosts',
  [FEATURES.TITLES]: 'podcastTitles',
  [FEATURES.HASHTAGS]: 'hashtags',
  [FEATURES.HIGHLIGHT_MOMENTS]: 'highlightMoments',
  [FEATURES.YOUTUBE_TIMESTAMPS]: 'youtubeChapters',
  [FEATURES.SUMMARY]: 'recaps',
} as const;

export type JobName =
  (typeof FEATURE_TO_JOB_MAP)[keyof typeof FEATURE_TO_JOB_MAP];
