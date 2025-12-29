'use server';

/**
 * Server Action: Generate All Missing Features After Upgrade
 *
 * When a user upgrades their plan, this action triggers generation of ALL
 * features available in their new plan that weren't generated when the project
 * was processed on their old plan.
 *
 * Example: User had Free plan (only Recaps), upgrades to Plus.
 * This will generate: Social Posts, Titles, Hashtags all at once.
 *
 */

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { inngest } from '@/inngest/client';
import { isMockPipeline } from '@/lib/_tests_/mock-flags';
import { queueMockRetryJob } from '@/lib/_tests_/mock-runner';
import { auth } from '@/lib/auth';
import { convex } from '@/lib/convex-client';
import { PODCAST_RETRY_JOB_EVENT } from '@/lib/events';
import {
  FEATURE_TO_JOB_MAP,
  type JobName,
  PLAN_FEATURES,
  type PlanName,
  PODCASTOGIST_USER_PLANS
} from '@/lib/tier-config';
import { humanize } from '@/lib/utils/utils';

/**
 * Generate all missing features for user's current plan
 *
 * Determines which features are available in current plan but missing from project,
 * then triggers parallel Inngest jobs to generate them all at once.
 */
export async function generateMissingFeatures(projectId: Id<'projects'>) {
  const authObj = await auth();
  const { userId, has } = authObj;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get user's current plan using Clerk's has() method
  let currentPlan: PlanName = PODCASTOGIST_USER_PLANS.FREE;
  if (has?.({ plan: PODCASTOGIST_USER_PLANS.MAX })) {
    currentPlan = PODCASTOGIST_USER_PLANS.MAX;
  } else if (has?.({ plan: PODCASTOGIST_USER_PLANS.PLUS })) {
    currentPlan = PODCASTOGIST_USER_PLANS.PLUS;
  }

  // Get project to check what's already generated
  const project = await convex.query(api.projects.getProject, { projectId });

  if (!project) {
    throw new Error('Project not found');
  }

  if (project.userId !== userId) {
    throw new Error('Unauthorized - not your project');
  }

  // Infer what plan was used during processing based on generated features
  let originalPlan: PlanName = PODCASTOGIST_USER_PLANS.FREE;
  if (project.highlightMoments || project.youtubeTimestamps) {
    originalPlan = PODCASTOGIST_USER_PLANS.MAX;
  } else if (project.socialPosts || project.titles || project.hashtags) {
    originalPlan = PODCASTOGIST_USER_PLANS.PLUS;
  }

  // Get all features available in current plan
  const availableFeatures = PLAN_FEATURES[currentPlan];

  const missingJobs: JobName[] = [];

  // Check which features are available but not yet generated
  for (const feature of availableFeatures) {
    const jobName =
      FEATURE_TO_JOB_MAP[feature as keyof typeof FEATURE_TO_JOB_MAP];
    if (!jobName) continue; // Skip transcription and summary (always present)

    // Check if this data exists in the project
    const hasData = Boolean(project[jobName as keyof typeof project]);

    if (!hasData) {
      missingJobs.push(jobName as JobName);
    }
  }

  if (missingJobs.length === 0) {
    throw new Error(
      'No missing features to generate. All features for your plan are already available.'
    );
  }

  // Used for the test suite
  if (isMockPipeline()) {
    missingJobs.forEach((job) => {
      queueMockRetryJob({
        projectId,
        job,
        originalPlan,
        currentPlan
      });
    });
  } else {
    // Trigger Inngest jobs for all missing features in parallel
    await Promise.all(
      missingJobs.map((job) =>
        inngest.send({
          name: PODCAST_RETRY_JOB_EVENT,
          data: {
            projectId,
            job,
            userId,
            originalPlan,
            currentPlan
          }
        })
      )
    );
  }

  return {
    success: true,
    generated: missingJobs,
    message: `Generating ${missingJobs.length} feature${
      missingJobs.length > 1 ? 's' : ''
    }: ${missingJobs
      .map(humanize)
      .join(', ')}. They will appear in your project shortly.`
  };
}
