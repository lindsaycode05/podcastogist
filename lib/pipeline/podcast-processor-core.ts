/**
 * Podcast Processing Workflow - Main Orchestration Function
 *
 * This is the core of the application - a durable, observable workflow that:
 * 1. Analyzes audio using AssemblyAI (transcription for AI use - runs for ALL plans)
 * 2. Generates AI content in parallel based on user's plan (FREE/PLUS/MAX)
 * 3. Saves all results to Convex for real-time UI updates
 *
 * Feature Gating by Plan:
 * - FREE: Recaps only
 * - PLUS: + Social Posts, Titles, Hashtags
 * - MAX: + YouTube Timestamps, Highlight Moments, Full Transcript Access
 *
 * Note: Audio analysis (transcription) runs for ALL users to power AI features.
 * Speaker diarization data is always captured but only viewable to MAX users.
 *
 * Inngest Benefits for This Use Case:
 * - Durable execution: If OpenAI times out, the step retries automatically
 * - Parallel execution: AI jobs run simultaneously, reducing total time
 * - Real-time updates: UI shows progress via Convex subscriptions
 * - Observability: Full execution history and logs in Inngest dashboard
 * - Type safety: Events and steps are fully typed
 *
 * Triggered by: Server action after file upload to Vercel Blob
 * Event: "podcast/uploaded" with { projectId, fileUrl, userPlan }
 *
 * Workflow Pattern:
 * 1. Update project status to "processing"
 * 2. Transcribe audio (sequential - required for next steps)
 * 3. Generate content in parallel (conditionally based on plan)
 * 4. Save all results atomically to Convex
 *
 * Real-time Updates:
 * - Convex jobStatus updates trigger automatic UI re-renders
 * - No polling or manual refetching required
 * - UI always shows accurate status from database
 */

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { generateHashtags } from '@/inngest/steps/ai-generation/hashtags';
import { generateHighlightMoments } from '@/inngest/steps/ai-generation/highlight-moments';
import { generateRecaps } from '@/inngest/steps/ai-generation/recaps';
import { generateSocialPosts } from '@/inngest/steps/ai-generation/social-posts';
import { generateTitles } from '@/inngest/steps/ai-generation/titles';
import { generateYouTubeTimestamps } from '@/inngest/steps/ai-generation/youtube-timestamps';
import { saveResultsToConvex } from '@/inngest/steps/resolution/save-to-convex';
import { transcribeWithAssemblyAI } from '@/inngest/steps/transcription/assembly-ai';
import { PODCAST_PROCESSING_PHASE_STATUS } from '@/lib/constants';
import { convex } from '@/lib/convex-client';
import { INNGEST_STEPS } from '@/lib/inngest-steps';
import type { StepTools } from '@/lib/pipeline/step-tools';
import { type PlanName, PODCASTOGIST_USER_PLANS } from '@/lib/tier-config';

export type PodcastUploadedEvent = {
  data: {
    projectId: Id<'projects'>;
    fileUrl: string;
    plan?: PlanName;
    userId?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
};

const pause = async (ms?: number) => {
  if (!ms || ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const isMissingProjectError = (error: unknown): boolean =>
  error instanceof Error &&
  error.message.includes('Update on nonexistent document ID');

export const runPodcastPipeline = async ({
  event,
  step,
  pauseMs
}: {
  event: PodcastUploadedEvent;
  step: StepTools;
  pauseMs?: number;
}): Promise<{
  success: boolean;
  projectId: Id<'projects'>;
  plan: PlanName;
}> => {
  const { projectId, fileUrl, plan: userPlan } = event.data;
  const plan = (userPlan as PlanName) || PODCASTOGIST_USER_PLANS.FREE;

  console.log(`Processing project ${projectId} for ${plan} plan`);

  try {
    // Mark project as processing in Convex (UI will show "Processing..." state)
    await step.run(INNGEST_STEPS.UPDATE_STATUS_PROCESSING, async () => {
      await convex.mutation(api.projects.updateProjectStatus, {
        projectId,
        status: 'processing'
      });
    });
    await pause(pauseMs);

    // Update jobStatus: transcription starting
    await step.run(
      INNGEST_STEPS.UPDATE_JOB_STATUS_TRANSCRIPTION_RUNNING,
      async () => {
        await convex.mutation(api.projects.updateJobStatus, {
          projectId,
          transcription: PODCAST_PROCESSING_PHASE_STATUS.RUNNING
        });
      }
    );
    await pause(pauseMs);

    // Step 1: Transcribe audio with AssemblyAI (sequential - blocks next steps)
    // Uses webhook + step.waitForEvent for durable waiting
    // Speaker diarization is always enabled; UI access is gated by plan
    const transcript = await transcribeWithAssemblyAI(
      step,
      fileUrl,
      projectId,
      plan
    );
    await pause(pauseMs);

    // Update jobStatus: transcription complete
    await step.run(
      INNGEST_STEPS.UPDATE_JOB_STATUS_TRANSCRIPTION_COMPLETED,
      async () => {
        await convex.mutation(api.projects.updateJobStatus, {
          projectId,
          transcription: PODCAST_PROCESSING_PHASE_STATUS.COMPLETED
        });
      }
    );
    await pause(pauseMs);

    // Update jobStatus: content generation starting
    await step.run(
      INNGEST_STEPS.UPDATE_JOB_STATUS_GENERATION_RUNNING,
      async () => {
        await convex.mutation(api.projects.updateJobStatus, {
          projectId,
          contentGeneration: PODCAST_PROCESSING_PHASE_STATUS.RUNNING
        });
      }
    );
    await pause(pauseMs);

    // Step 2: Run AI generation tasks in parallel based on plan
    // Parallel Pattern: Promise.allSettled allows individual failures without blocking others
    // Performance: ~60s total vs. ~300s sequential (5x faster)
    // Each function can fail independently - we save whatever succeeds

    // Determine which jobs to run based on plan
    // biome-ignore lint: different features return different structures
    const jobs: Promise<any>[] = [];
    const jobNames: string[] = [];

    // Recaps - available to all plans
    jobs.push(generateRecaps(step, transcript));
    jobNames.push('recaps');

    // Plus and Max features
    if (
      plan === PODCASTOGIST_USER_PLANS.PLUS ||
      plan === PODCASTOGIST_USER_PLANS.MAX
    ) {
      jobs.push(generateSocialPosts(step, transcript));
      jobNames.push('socialPosts');

      jobs.push(generateTitles(step, transcript));
      jobNames.push('titles');

      jobs.push(generateHashtags(step, transcript));
      jobNames.push('hashtags');
    } else {
      console.log(`Skipping social posts, titles, hashtags for ${plan} plan`);
    }

    // Max-only features
    if (plan === PODCASTOGIST_USER_PLANS.MAX) {
      jobs.push(generateHighlightMoments(transcript));
      jobNames.push('highlightMoments');

      jobs.push(generateYouTubeTimestamps(step, transcript));
      jobNames.push('youtubeTimestamps');
    } else {
      console.log(
        `Skipping highlight moments and YouTube timestamps for ${plan} plan`
      );
    }

    // Run all enabled jobs in parallel
    const results = await Promise.allSettled(jobs);

    // Extract successful results based on plan
    // Build results object dynamically based on what was run
    // biome-ignore lint: different features return different structures
    const generatedContent: Record<string, any> = {};

    results.forEach((result, idx) => {
      const jobName = jobNames[idx];
      if (result.status === 'fulfilled') {
        generatedContent[jobName] = result.value;
      }
    });

    // Track errors for each failed job
    const jobErrors: Record<string, string> = {};

    results.forEach((result, idx) => {
      if (result.status === 'rejected') {
        const jobName = jobNames[idx];
        const errorMessage =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);

        jobErrors[jobName] = errorMessage;
        console.error(`Failed to generate ${jobName}:`, result.reason);
      }
    });

    // Save errors to Convex if any jobs failed
    if (Object.keys(jobErrors).length > 0) {
      await step.run(INNGEST_STEPS.SAVE_JOB_ERRORS, () =>
        convex.mutation(api.projects.saveJobErrors, {
          projectId,
          jobErrors
        })
      );
    }

    // Update jobStatus: content generation complete
    await step.run(
      INNGEST_STEPS.UPDATE_JOB_STATUS_GENERATION_COMPLETED,
      async () => {
        await convex.mutation(api.projects.updateJobStatus, {
          projectId,
          contentGeneration: PODCAST_PROCESSING_PHASE_STATUS.COMPLETED
        });
      }
    );
    await pause(pauseMs);

    // Step 3: Save all results to Convex in one atomic operation
    // Convex mutation updates the project, triggering UI re-render
    await step.run(INNGEST_STEPS.SAVE_RESULTS_TO_CONVEX, () =>
      saveResultsToConvex(projectId, generatedContent)
    );
    await pause(pauseMs);

    // Workflow complete - return success
    return { success: true, projectId, plan };
  } catch (error) {
    if (isMissingProjectError(error)) {
      console.warn(
        `Project ${projectId} no longer exists. Stopping pipeline safely.`
      );
      return { success: false, projectId, plan };
    }

    console.error('Podcast processing failed:', error);

    try {
      // Update project status to failed with error details
      // NOTE: NOT wrapped in step.run() so this executes immediately, even during retries
      await convex.mutation(api.projects.recordError, {
        projectId,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        step: 'workflow',
        details: error instanceof Error ? { stack: error.stack } : undefined
      });
    } catch (recordError) {
      console.error('Failed to record error:', recordError);
    }

    throw error;
  }
};
