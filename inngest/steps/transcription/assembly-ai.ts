/**
 * AssemblyAI Transcription Step
 *
 * Transcribes podcast audio using AssemblyAI's API with advanced features:
 * - Speaker diarization: Identifies who is speaking (always enabled, UI-gated for MAX)
 * - Auto chapters: AI-detected topic changes with summaries
 * - Word-level timestamps: Precise timing for each word
 * - Formatted text: Punctuation and capitalization
 *
 * Integration Flow:
 * 1. Receive audio URL from Vercel Blob and user's plan
 * 2. Submit to AssemblyAI with all features enabled + webhook URL
 * 3. Wait for AssemblyAI webhook via Inngest (durable, no long-running HTTP)
 * 4. Fetch final transcript once AssemblyAI is done
 * 5. Transform response to match our Convex schema
 * 6. Save to Convex (triggers UI update)
 * 7. Return enhanced transcript for AI generation
 *
 * Feature Gating:
 * - Speaker diarization data is always captured during transcription
 * - UI access to speaker dialogue is restricted to MAX plan users
 * - Auto chapters and word timestamps for all plans
 *
 * Error Handling:
 * - AssemblyAI errors: Marked as failed, error recorded in Convex
 * - Inngest automatic retries: Transient failures are retried
 * - Status tracking: jobStatus.transcription updated in real-time
 *
 * Design Decision: Why AssemblyAI over OpenAI Whisper?
 * - Speaker diarization: AssemblyAI has better multi-speaker detection
 * - Auto chapters: Helps with AI content generation (better context)
 * - Faster processing: Optimized for speech (vs. Whisper for accuracy)
 * - Async API: Better for long podcasts (no timeout issues)
 */
import type { step as InngestStep } from 'inngest';
import { AssemblyAI } from 'assemblyai';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { convex } from '@/lib/convex-client';
import { ASSEMBLYAI_TRANSCRIPT_STATUS_EVENT } from '@/lib/events';
import { INNGEST_STEPS } from '@/lib/inngest-steps';
import { PODCASTOGIST_USER_PLANS, type PlanName } from '@/lib/tier-config';
import type {
  AssemblyAIChapter,
  AssemblyAISegment,
  AssemblyAIUtterance,
  AssemblyAIWebhookEvent,
  AssemblyAIWord,
  TranscriptWithExtras,
} from '@/lib/types';

// Initialize AssemblyAI client with API key from environment
const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || '',
});

function buildAssemblyAIWebhookUrl(projectId: Id<'projects'>): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is required for AssemblyAI webhooks');
  }

  const webhookUrl = new URL('/api/webhooks/assemblyai', appUrl);
  webhookUrl.searchParams.set('projectId', projectId);

  return webhookUrl.toString();
}

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
  step: typeof InngestStep,
  audioUrl: string,
  projectId: Id<'projects'>,
  userPlan: PlanName = PODCASTOGIST_USER_PLANS.FREE
): Promise<TranscriptWithExtras> {
  console.log(
    `Starting AssemblyAI transcription for project ${projectId} (${userPlan} plan)`
  );

  try {
    const webhookUrl = buildAssemblyAIWebhookUrl(projectId);

    // Submit transcription job to AssemblyAI (non-blocking)
    const submittedTranscript = await step.run(
      INNGEST_STEPS.START_ASSEMBLYAI_TRANSCRIPTION,
      async () =>
        assemblyai.transcripts.submit({
          audio: audioUrl, // Public URL - AssemblyAI downloads the file
          speaker_labels: true, // Always enable speaker diarization (UI-gated for MAX)
          auto_chapters: true, // Detect topic changes automatically
          format_text: true, // Add punctuation and capitalization
          // The webhook URL AssemblyAI will call on transcription finalization
          webhook_url: webhookUrl,
          // Handles Vercel Automation Bypass authing so AssemblyAI webhook service can reach our webhook API route successfully
          webhook_auth_header_name: 'x-vercel-protection-bypass',
          webhook_auth_header_value:
            process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
        })
    );

    const transcriptId =
      (submittedTranscript as { id?: string; transcript_id?: string }).id ||
      (submittedTranscript as { id?: string; transcript_id?: string })
        .transcript_id;

    if (!transcriptId) {
      throw new Error('AssemblyAI did not return a transcript ID');
    }

    console.log(`AssemblyAI job queued: ${transcriptId}`);

    // Wait for AssemblyAI webhook via Inngest (durable wait/no long HTTP that causes timeouts on Vercel)
    const webhookEvent = (await step.waitForEvent(
      INNGEST_STEPS.WAIT_FOR_ASSEMBLYAI_TRANSCRIPTION,
      {
        event: ASSEMBLYAI_TRANSCRIPT_STATUS_EVENT,
        // No podcast will realistically exceed 3 hours of transcription, can be increased if needed, no problem on that front
        timeout: '3h',
        // Ensure we only capture the webhook incoming for this specific transcript/project/podcast, matches the projectId param we initiate the whole Inngest job with
        match: 'data.projectId',
      }
    )) as AssemblyAIWebhookEvent | null;

    if (!webhookEvent) {
      throw new Error('AssemblyAI webhook timed out');
    }

    if (webhookEvent.data?.status === 'error') {
      throw new Error(
        webhookEvent.data?.error || 'AssemblyAI transcription failed'
      );
    }

    // Fetch final transcript after webhook signals completion
    const transcriptResponse = await step.run(
      INNGEST_STEPS.FETCH_ASSEMBLYAI_TRANSCRIPT,
      async () => assemblyai.transcripts.get(transcriptId)
    );

    // Check for transcription errors
    if (transcriptResponse.status === 'error') {
      throw new Error(
        transcriptResponse.error || 'AssemblyAI transcription failed'
      );
    }

    if (transcriptResponse.status !== 'completed') {
      throw new Error(
        `AssemblyAI transcription not completed (status: ${transcriptResponse.status})`
      );
    }

    console.log('AssemblyAI transcription completed');

    // Type assertion: AssemblyAI's TypeScript types are incomplete
    // We manually define the full response structure in our types file
    const response = transcriptResponse as unknown as {
      text: string;
      segments: AssemblyAISegment[];
      chapters: AssemblyAIChapter[];
      utterances: AssemblyAIUtterance[];
      words: AssemblyAIWord[];
      audio_duration?: number; // Duration in milliseconds
    };

    console.log(
      `Transcribed ${response.words?.length || 0} words, ${
        response.segments?.length || 0
      } segments, ${response.chapters?.length || 0} chapters, ${
        response.utterances?.length || 0
      } speakers`
    );

    // Transform AssemblyAI response to match our Convex schema
    const assemblySegments: AssemblyAISegment[] = response.segments || [];
    const assemblyChapters: AssemblyAIChapter[] = response.chapters || [];
    const assemblyUtterances: AssemblyAIUtterance[] = response.utterances || [];

    // Format segments with word-level timing data
    const formattedSegments = assemblySegments.map((segment, idx) => ({
      id: idx,
      start: segment.start,
      end: segment.end,
      text: segment.text,
      // Transform word structure to match Convex schema
      words: (segment.words || []).map((word) => ({
        word: word.text,
        start: word.start,
        end: word.end,
      })),
    }));

    // Prepare transcript object for Convex
    const formattedTranscript = {
      text: response.text || '',
      segments: formattedSegments,
    };

    // Transform speaker utterances (convert milliseconds to seconds for consistency)
    const speakers = assemblyUtterances.map(
      (utterance: AssemblyAIUtterance) => ({
        speaker: utterance.speaker,
        start: utterance.start / 1000, // ms to seconds
        end: utterance.end / 1000, // ms to seconds
        text: utterance.text,
        confidence: utterance.confidence,
      })
    );

    // Format chapters for Convex (keep milliseconds as AssemblyAI provides them)
    const chapters = assemblyChapters.map((chapter: AssemblyAIChapter) => ({
      start: chapter.start,
      end: chapter.end,
      headline: chapter.headline,
      summary: chapter.summary,
      gist: chapter.gist,
    }));

    // Save complete transcript with speakers AND chapters to Convex
    // This ensures retry jobs have all the data they need
    await convex.mutation(api.projects.saveTranscript, {
      projectId,
      transcript: {
        ...formattedTranscript,
        speakers,
        chapters, // Include chapters so retry can access them
      },
    });

    // Return enhanced transcript for AI generation steps
    // Includes chapters and utterances which help improve AI content quality
    return {
      text: response.text || '',
      segments: formattedSegments,
      chapters: assemblyChapters,
      utterances: assemblyUtterances,
      audio_duration: response.audio_duration, // Include audio duration
    };
  } catch (error) {
    console.error('AssemblyAI transcription error:', error);

    // Record detailed error for debugging
    await convex.mutation(api.projects.recordError, {
      projectId,
      message: error instanceof Error ? error.message : 'Transcription failed',
      step: 'transcription',
    });

    // Re-throw to stop workflow execution (Inngest will retry based on config)
    throw error;
  }
}
