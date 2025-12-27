/**
 * Tier Utilities for Plan Detection and Validation
 *
 * Provides functions to:
 * - Validate uploads against plan limits using Clerk's has() method
 * - Check feature access
 *
 * All plan checks use Clerk's native billing system per:
 * https://clerk.com/docs/nextjs/guides/billing/for-b2c
 */
import type { auth as authType } from '@clerk/nextjs/server';
import { api } from '@/convex/_generated/api';
import { convex } from '@/lib/convex-client';
import {
  type FeatureName,
  PLAN_FEATURES,
  PLAN_LIMITS,
  type PlanName,
  PODCASTOGIST_USER_PLANS
} from '../tier-config';

export interface UploadValidationResult {
  allowed: boolean;
  reason?: 'file_size' | 'duration' | 'project_limit';
  message?: string;
  currentCount?: number;
  limit?: number;
}

/**
 * Validate if user can upload a file based on their plan limits
 *
 * Checks:
 * 1. File size against plan limit
 * 2. Duration against plan limit (if provided)
 * 3. Project count against plan limit
 *
 * @param auth - Clerk auth object
 * @param userId - User ID for project counting
 * @param fileSize - File size in bytes
 * @param duration - Optional duration in seconds
 * @returns Validation result with details
 */
export const checkUploadLimits = async (
  auth: Awaited<ReturnType<typeof authType>>,
  userId: string,
  fileSize: number,
  duration?: number
): Promise<UploadValidationResult> => {
  // Get user's plan using Clerk's has() method
  const { has } = auth;
  let plan: PlanName = PODCASTOGIST_USER_PLANS.FREE;
  if (has?.({ plan: PODCASTOGIST_USER_PLANS.MAX })) {
    plan = PODCASTOGIST_USER_PLANS.MAX;
  } else if (has?.({ plan: PODCASTOGIST_USER_PLANS.PLUS })) {
    plan = PODCASTOGIST_USER_PLANS.PLUS;
  }

  const limits = PLAN_LIMITS[plan];

  // Check file size limit
  if (fileSize > limits.maxFileSize) {
    return {
      allowed: false,
      reason: 'file_size',
      message: `File size (${(fileSize / (1024 * 1024)).toFixed(
        1
      )}MB) exceeds your plan limit of ${(
        limits.maxFileSize / (1024 * 1024)
      ).toFixed(0)}MB`
    };
  }

  // Check duration limit (if duration provided and plan has limit)
  if (duration && limits.maxDuration && duration > limits.maxDuration) {
    const durationMinutesAndSeconds = `${Math.floor(duration / 60)}m ${
      duration % 60
    }s`;
    const limitMinutes = Math.floor(limits.maxDuration / 60);
    return {
      allowed: false,
      reason: 'duration',
      message: `Duration (${durationMinutesAndSeconds}) exceeds your plan limit of ${limitMinutes} minutes`
    };
  }

  // Check project count limit (skip for MAX - unlimited)
  if (limits.maxProjects !== null) {
    // FREE: count all projects (including deleted)
    // PLUS: count only active projects
    const includeDeleted = plan === PODCASTOGIST_USER_PLANS.FREE;
    const projectCount = await convex.query(api.projects.getUserProjectCount, {
      userId,
      includeDeleted
    });

    if (projectCount >= limits.maxProjects) {
      return {
        allowed: false,
        reason: 'project_limit',
        message: `You've reached your plan limit of ${limits.maxProjects} ${
          plan === PODCASTOGIST_USER_PLANS.FREE ? 'total' : 'active'
        } projects`,
        currentCount: projectCount,
        limit: limits.maxProjects
      };
    }
  }

  // All checks passed
  return { allowed: true };
};

/**
 * Get list of features available to a plan
 *
 * @param plan - Plan name
 * @returns Array of feature names available to the plan
 */
export const getPlanFeatures = (plan: PlanName): FeatureName[] => {
  return PLAN_FEATURES[plan];
};

/**
 * Check if a plan has a specific feature
 *
 * @param plan - Plan name
 * @param feature - Feature to check
 * @returns True if plan includes feature
 */
export const planHasFeature = (
  plan: PlanName,
  feature: FeatureName
): boolean => {
  return PLAN_FEATURES[plan].includes(feature);
};

/**
 * Get the minimum plan required for a feature
 *
 * @param feature - Feature name
 * @returns Minimum plan name that includes this feature
 */
export const getMinimumPlanForFeature = (feature: FeatureName): PlanName => {
  if (PLAN_FEATURES.free.includes(feature)) return PODCASTOGIST_USER_PLANS.FREE;
  if (PLAN_FEATURES.plus.includes(feature)) return PODCASTOGIST_USER_PLANS.PLUS;
  return PODCASTOGIST_USER_PLANS.MAX;
};
