/**
 * Retry Job Function - Retries Individual Failed Generation Steps
 *
 * Triggered when user clicks retry button on a failed tab.
 * Regenerates just that specific output without reprocessing everything.
 * Supports upgrade scenarios - if user upgraded, can generate newly-unlocked features.
 */
import { api } from '@/convex/_generated/api';
import { convex } from '@/lib/convex-client';
import type { PlanName, FeatureName } from '@/lib/tier-config';
import { FEATURE_TO_JOB_MAP, FEATURES, PODCASTOGIST_USER_PLANS } from '@/lib/tier-config';
import { planHasFeature } from '@/lib/tier-utils';
import { inngest } from '../client';
import { generateHashtags } from '../steps/ai-generation/hashtags';
import { generateHighlightMoments } from '../steps/ai-generation/highlight-moments';
import { generateSocialPosts } from '../steps/ai-generation/social-posts';
import { generateRecaps } from '../steps/ai-generation/recaps';
import { generateTitles } from '../steps/ai-generation/titles';
import { generateYouTubeTimestamps } from '../steps/ai-generation/youtube-timestamps';
import { PODCAST_RETRY_JOB_EVENT } from '@/lib/events';
import { TranscriptWithExtras } from '@/lib/types';
import { INNGEST_STEPS } from '@/lib/inngest-steps';

const FUNCTION_NAME = 'retry-job';

export const retryJob = inngest.createFunction(
  { id: FUNCTION_NAME },
  { event: PODCAST_RETRY_JOB_EVENT },
  async ({ event, step }) => {
    const { projectId, job, originalPlan, currentPlan } = event.data;

    // Check if user has upgraded and now has access to this feature
    const currentUserPlan =
      (currentPlan as PlanName) || PODCASTOGIST_USER_PLANS.FREE;
    const originalUserPlan =
      (originalPlan as PlanName) || PODCASTOGIST_USER_PLANS.FREE;

    // Get feature key from job name using the shared mapping
    const jobToFeature = Object.fromEntries(
      Object.entries(FEATURE_TO_JOB_MAP).map(([k, v]) => [v, k])
    );

    // Check if user has access to this feature with current plan
    const featureKey = jobToFeature[job];
    if (
      featureKey &&
      !planHasFeature(currentUserPlan, featureKey as FeatureName)
    ) {
      throw new Error(
        `This feature (${job}) is not available on your current plan. Please upgrade to access it.`
      );
    }

    // Log if this is an upgrade scenario
    if (originalUserPlan !== currentUserPlan) {
      console.log(
        `User upgraded from ${originalUserPlan} to ${currentUserPlan}. Generating ${job}.`
      );
    }

    // Get project to access transcript
    const project = await convex.query(api.projects.getProject, { projectId });
    if (!project?.transcript) {
      throw new Error('Project or transcript not found');
    }

    // Validate we have the complete transcript data needed for generation
    const transcript = project.transcript as TranscriptWithExtras;

    // Basic validation: All jobs need transcript text
    if (!transcript.text || transcript.text.length === 0) {
      throw new Error(
        'Cannot generate content: transcript text is empty. Please re-upload the file.'
      );
    }

    // Job-specific validation for jobs that require chapters
    const jobsRequiringChapters = ['highlightMoments', 'youtubeTimestamps'];
    if (jobsRequiringChapters.includes(job)) {
      if (!transcript.chapters || transcript.chapters.length === 0) {
        throw new Error(
          `Cannot generate ${job}: transcript has no chapters. This podcast may be too short or lack distinct topics for chapter detection.`
        );
      }
    }

    // Other jobs (summary, socialPosts, titles, hashtags) can work with just text
    // They will use chapters if available for better context, but don't require them

    // Regenerate the specific job
    try {
      switch (job) {
        case FEATURE_TO_JOB_MAP[FEATURES.HIGHLIGHT_MOMENTS as keyof typeof FEATURE_TO_JOB_MAP]: {
          const result = await generateHighlightMoments(transcript);
          await step.run(INNGEST_STEPS.SAVE_HIGHLIGHT_MOMENTS, () =>
            convex.mutation(api.projects.saveGeneratedContent, {
              projectId,
              highlightMoments: result,
            })
          );
          break;
        }

        case FEATURE_TO_JOB_MAP[FEATURES.RECAPS as keyof typeof FEATURE_TO_JOB_MAP]: {
          const result = await generateRecaps(step, transcript);
          await step.run(INNGEST_STEPS.SAVE_RECAPS, () =>
            convex.mutation(api.projects.saveGeneratedContent, {
              projectId,
              recaps: result,
            })
          );
          break;
        }

        case FEATURE_TO_JOB_MAP[FEATURES.SOCIAL_POSTS as keyof typeof FEATURE_TO_JOB_MAP]: {
          const result = await generateSocialPosts(step, transcript);
          await step.run(INNGEST_STEPS.SAVE_SOCIAL_POSTS, () =>
            convex.mutation(api.projects.saveGeneratedContent, {
              projectId,
              socialPosts: result,
            })
          );
          break;
        }

        case FEATURE_TO_JOB_MAP[FEATURES.TITLES as keyof typeof FEATURE_TO_JOB_MAP]: {
          const result = await generateTitles(step, transcript);
          await step.run(INNGEST_STEPS.SAVE_TITLES, () =>
            convex.mutation(api.projects.saveGeneratedContent, {
              projectId,
              titles: result,
            })
          );
          break;
        }

        case FEATURE_TO_JOB_MAP[FEATURES.HASHTAGS as keyof typeof FEATURE_TO_JOB_MAP]: {
          const result = await generateHashtags(step, transcript);
          await step.run(INNGEST_STEPS.SAVE_HASHTAGS, () =>
            convex.mutation(api.projects.saveGeneratedContent, {
              projectId,
              hashtags: result,
            })
          );
          break;
        }

        case FEATURE_TO_JOB_MAP[FEATURES.YOUTUBE_TIMESTAMPS as keyof typeof FEATURE_TO_JOB_MAP]: {
          const result = await generateYouTubeTimestamps(step, transcript);
          await step.run(INNGEST_STEPS.SAVE_YOUTUBE_TIMESTAMPS, () =>
            convex.mutation(api.projects.saveGeneratedContent, {
              projectId,
              youtubeTimestamps: result,
            })
          );
          break;
        }
      }

      // Clear the error for this job after successful completion
      await step.run(INNGEST_STEPS.CLEAR_JOB_ERROR, async () => {
        const currentErrors = project.jobErrors || {};
        const updatedErrors = { ...currentErrors };
        delete updatedErrors[job as keyof typeof updatedErrors];

        await convex.mutation(api.projects.saveJobErrors, {
          projectId,
          jobErrors: updatedErrors,
        });
      });

      return { success: true, job };
    } catch (error) {
      // Save the error back to Convex
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await convex.mutation(api.projects.saveJobErrors, {
        projectId,
        jobErrors: {
          [job]: errorMessage,
        },
      });

      throw error;
    }
  }
);
