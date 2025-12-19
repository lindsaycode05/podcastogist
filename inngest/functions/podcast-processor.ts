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
import { inngest } from '@/inngest/client';
import { PODCASTOGIST_USER_PLANS, type PlanName } from '@/lib/tier-config';
import { generateHashtags } from '../steps/ai-generation/hashtags';
import { generateHighlightMoments } from '../steps/ai-generation/highlight-moments';
import { generateSocialPosts } from '../steps/ai-generation/social-posts';
import { generateRecaps } from '../steps/ai-generation/recaps';
import { generateTitles } from '../steps/ai-generation/titles';
import { generateYouTubeTimestamps } from '../steps/ai-generation/youtube-timestamps';
import { transcribeWithAssemblyAI } from '../steps/transcription/assembly-ai';
import { saveResultsToConvex } from '../steps/resolution/save-to-convex';
import { convex } from '@/lib/convex-client';
import { PODCAST_UPLOADED_EVENT } from '@/lib/events';
import { INNGEST_STEPS } from '@/lib/inngest-steps';
import { PODCAST_PROCESSING_PHASE_STATUS } from '@/lib/constants';

const FUNCTION_NAME = 'podcast-processor';

export const podcastProcessor = inngest.createFunction(
  {
    id: FUNCTION_NAME,
    // Optimizes parallel step execution (important for the 6 parallel AI jobs)
    optimizeParallelism: true,
    // Retry configuration: 3 attempts with exponential backoff
    retries: 3,
  },
  // Event trigger: sent by server action after upload
  { event: PODCAST_UPLOADED_EVENT },
  async ({ event, step }) => {
    const { projectId, fileUrl, plan: userPlan } = event.data;
    // Default to free if not provided
    const plan = (userPlan as PlanName) || PODCASTOGIST_USER_PLANS.FREE;

    console.log(`Processing project ${projectId} for ${plan} plan`);

    try {
      // Mark project as processing in Convex (UI will show "Processing..." state)
      await step.run(INNGEST_STEPS.UPDATE_STATUS_PROCESSING, async () => {
        await convex.mutation(api.projects.updateProjectStatus, {
          projectId,
          status: 'processing',
        });
      });

      // Update jobStatus: transcription starting
      await step.run(
        INNGEST_STEPS.UPDATE_JOB_STATUS_TRANSCRIPTION_RUNNING,
        async () => {
          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            transcription: PODCAST_PROCESSING_PHASE_STATUS.RUNNING,
          });
        }
      );

      // Step 1: Transcribe audio with AssemblyAI (sequential - blocks next steps)
      // Uses webhook + step.waitForEvent for durable waiting
      // Speaker diarization is always enabled; UI access is gated by plan
      const transcript = await transcribeWithAssemblyAI(
        step,
        fileUrl,
        projectId,
        plan
      );

      // Update jobStatus: transcription complete
      await step.run(
        INNGEST_STEPS.UPDATE_JOB_STATUS_TRANSCRIPTION_COMPLETED,
        async () => {
          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            transcription: PODCAST_PROCESSING_PHASE_STATUS.COMPLETED,
          });
        }
      );

      // Update jobStatus: content generation starting
      await step.run(
        INNGEST_STEPS.UPDATE_JOB_STATUS_GENERATION_RUNNING,
        async () => {
          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            contentGeneration: PODCAST_PROCESSING_PHASE_STATUS.RUNNING,
          });
        }
      );

      // Step 2: Run AI generation tasks in parallel based on plan
      // Parallel Pattern: Promise.allSettled allows individual failures without blocking others
      // Performance: ~60s total vs. ~300s sequential (5x faster)
      // Each function can fail independently - we save whatever succeeds

      // Determine which jobs to run based on plan
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
            jobErrors,
          })
        );
      }

      // Update jobStatus: content generation complete
      await step.run(
        INNGEST_STEPS.UPDATE_JOB_STATUS_GENERATION_COMPLETED,
        async () => {
          await convex.mutation(api.projects.updateJobStatus, {
            projectId,
            contentGeneration: PODCAST_PROCESSING_PHASE_STATUS.COMPLETED,
          });
        }
      );

      // Step 3: Save all results to Convex in one atomic operation
      // Convex mutation updates the project, triggering UI re-render
      await step.run(INNGEST_STEPS.SAVE_RESULTS_TO_CONVEX, () =>
        saveResultsToConvex(projectId, generatedContent)
      );

      // Workflow complete - return success
      return { success: true, projectId, plan };
    } catch (error) {
      // Handle any errors that occur during the workflow
      console.error('Podcast processing failed:', error);

      // Update project status to failed with error details
      // NOTE: NOT wrapped in step.run() so this executes immediately, even during retries
      try {
        await convex.mutation(api.projects.recordError, {
          projectId,
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
          step: 'workflow',
          details: error instanceof Error ? { stack: error.stack } : undefined,
        });
      } catch (cleanupError) {
        // If cleanup fails, log it but don't prevent the original error from being thrown
        console.error('Failed to update project status:', cleanupError);
      }

      // Re-throw to mark function as failed in Inngest (triggers retry if attempts remain)
      throw error;
    }
  }
);
