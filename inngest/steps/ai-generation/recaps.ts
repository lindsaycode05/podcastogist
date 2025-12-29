/**
 * AI Recaps Generation Step
 *
 * Generates multi-format podcast summaries using OpenAI GPT.
 *
 * Recaps Formats:
 * - Full: 200-300 word comprehensive overview for show notes
 * - Bullets: 5-7 scannable key points for quick reference
 * - Insights: 3-5 actionable takeaways for the audience
 * - TL;DR: One-sentence hook for social media
 *
 * Integration:
 * - Uses OpenAI Structured Outputs (zodResponseFormat) for type safety
 * - Wrapped in step.ai.wrap() for Inngest observability and automatic retries
 * - Leverages AssemblyAI chapters for better context understanding
 *
 * Design Decision: Why multiple recaps formats?
 * - Different use cases: blog, email, social, show notes
 * - Saves manual editing time for content creators
 * - Each format optimized for its specific purpose
 */
import type OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { INNGEST_STEPS } from '@/lib/inngest-steps';
import { BASE_OPENAI_MODEL } from '@/lib/openai-client';
import type { StepTools } from '@/lib/pipeline/step-tools';
import { aiProvider } from '@/lib/providers/ai-provider';
import type { TranscriptWithExtras } from '@/lib/types';
import { type Recaps, recapsSchema } from '@/schemas/ai-outputs';

// System prompt defines GPT's role and expertise
const RECAPS_SYSTEM_PROMPT =
  'You are an expert podcast content analyst and marketing strategist. Your summaries are engaging, insightful, and highlight the most valuable takeaways for listeners.';

/**
 * Builds the user prompt with transcript context and detailed instructions
 *
 * Prompt Engineering Techniques:
 * - Provides first 3000 chars of transcript (balance context vs. token cost)
 * - Includes AssemblyAI chapters for topic structure
 * - Specific formatting requirements for each recaps type
 * - Examples and constraints to guide GPT output
 */
function buildRecapsPrompt(transcript: TranscriptWithExtras): string {
  return `Analyze this podcast transcript in detail and create a comprehensive recaps package.

TRANSCRIPT (first 3000 chars):
${transcript.text.substring(0, 3000)}...

${
  transcript.chapters.length > 0
    ? `\nAUTO-DETECTED CHAPTERS:\n${transcript.chapters
        .map((ch, idx) => `${idx + 1}. ${ch.headline} - ${ch.summary}`)
        .join('\n')}`
    : ''
}

Create a recaps with:

1. FULL OVERVIEW (200-300 words):
   - What is this podcast about?
   - Who is speaking and what's their perspective?
   - What are the main themes and arguments?
   - Why should someone listen to this?

2. KEY BULLET POINTS (5-7 items):
   - Main topics discussed in order
   - Important facts or statistics mentioned
   - Key arguments or positions taken
   - Notable quotes or moments

3. ACTIONABLE INSIGHTS (3-5 items):
   - What can listeners learn or apply?
   - Key takeaways that provide value
   - Perspectives that challenge conventional thinking
   - Practical advice or recommendations

4. TL;DR (one compelling sentence):
   - Capture the essence and hook interest
   - Make someone want to listen

Be specific, engaging, and valuable. Focus on what makes this podcast unique and worth listening to.`;
}

/**
 * Generates recaps using OpenAI GPT with structured outputs
 *
 * Error Handling:
 * - Returns fallback recaps on API failure (graceful degradation)
 * - Logs errors for debugging
 * - Doesn't throw (allows other parallel jobs to continue)
 *
 * Inngest Integration:
 * - step.ai.wrap() tracks token usage and performance
 * - Provides automatic retry on transient failures
 * - Shows AI call details in Inngest dashboard
 */
export async function generateRecaps(
  step: StepTools,
  transcript: TranscriptWithExtras
): Promise<Recaps> {
  console.log('Generating podcast recaps with GPT-5');

  try {
    const createCompletion = aiProvider.createChatCompletion;

    // Call OpenAI with Structured Outputs for type-safe response
    const response = (await step.ai.wrap(
      INNGEST_STEPS.AI.GENERATE_RECAPS,
      createCompletion,
      {
        model: BASE_OPENAI_MODEL,
        messages: [
          { role: 'system', content: RECAPS_SYSTEM_PROMPT },
          { role: 'user', content: buildRecapsPrompt(transcript) }
        ],
        // zodResponseFormat ensures response matches recapsSchema
        response_format: zodResponseFormat(recapsSchema, 'recaps')
      }
    )) as OpenAI.Chat.Completions.ChatCompletion;

    const content = response.choices[0]?.message?.content;
    // Parse and validate response against schema
    const recaps = content
      ? recapsSchema.parse(JSON.parse(content))
      : {
          // Fallback: use raw transcript if parsing fails
          full: transcript.text.substring(0, 500),
          bullets: ['Full transcript available'],
          insights: ['See transcript'],
          tldr: transcript.text.substring(0, 200)
        };

    return recaps;
  } catch (error) {
    console.error('GPT recaps generation error:', error);

    // Graceful degradation: return error message but allow workflow to continue
    return {
      full: '⚠️ Error generating recaps with GPT-5. Please check logs or try again.',
      bullets: ['Recaps generation failed - see full transcript'],
      insights: ['Error occurred during AI generation'],
      tldr: 'Recaps generation failed'
    };
  }
}
