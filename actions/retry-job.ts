'use server';

/**
 * Server Action: Retry Failed Generation Job
 *
 * Allows users to retry individual AI generation steps that failed.
 * Also handles upgrade scenarios - if user upgraded, regenerates locked features.
 * Triggers a new Inngest event to regenerate just that specific output.
 */

import { inngest } from '@/inngest/client';
import { auth } from '@clerk/nextjs/server';
import type { Id } from '@/convex/_generated/dataModel';
import { convex } from '@/lib/convex-client';
import { api } from '@/convex/_generated/api';
import { JobName, PlanName, PODCASTOGIST_USER_PLANS } from '@/lib/tier-config';
import { PODCAST_RETRY_JOB_EVENT } from '@/lib/events';

export async function retryJob(projectId: Id<'projects'>, job: JobName) {
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

  // Get project to check what was already generated
  const project = await convex.query(api.projects.getProject, { projectId });

  if (!project) {
    throw new Error('Project not found');
  }

  // Infer original plan from what features were generated
  let originalPlan: PlanName = PODCASTOGIST_USER_PLANS.FREE;
  if (project.highlightMoments || project.youtubeTimestamps) {
    originalPlan = PODCASTOGIST_USER_PLANS.MAX;
  } else if (project.socialPosts || project.titles || project.hashtags) {
    originalPlan = PODCASTOGIST_USER_PLANS.PLUS;
  }

  // Trigger Inngest event to retry the specific job
  // Pass both original and current plans to detect upgrades
  await inngest.send({
    name: PODCAST_RETRY_JOB_EVENT,
    data: {
      projectId,
      job,
      userId,
      originalPlan,
      currentPlan
    }
  });

  return { success: true };
}
