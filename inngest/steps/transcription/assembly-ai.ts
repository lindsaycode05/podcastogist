import type { Id } from '@/convex/_generated/dataModel';
import type { StepTools } from '@/lib/pipeline/step-tools';
import { transcribePodcast } from '@/lib/providers/transcription-provider';
import { type PlanName, PODCASTOGIST_USER_PLANS } from '@/lib/tier-config';
import type { TranscriptWithExtras } from '@/lib/types';

/**
 * Main transcription function called by Inngest workflow
 *
 * @param step - Inngest step tools for durable waits and retries
 * @param audioUrl - Public URL to audio file (from Vercel Blob)
 * @param projectId - Convex project ID for status updates
 * @param userPlan - User's subscription plan (for logging, speaker data always captured)
 * @returns TranscriptWithExtras - Enhanced transcript with chapters and speakers
 */
export async function transcribeWithAssemblyAI(
  step: StepTools,
  audioUrl: string,
  projectId: Id<'projects'>,
  userPlan: PlanName = PODCASTOGIST_USER_PLANS.FREE
): Promise<TranscriptWithExtras> {
  return transcribePodcast(step, audioUrl, projectId, userPlan);
}
