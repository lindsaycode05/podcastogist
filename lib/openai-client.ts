/**
 * OpenAI Client Configuration
 *
 * Centralized OpenAI client used by all AI generation steps.
 *
 * Usage Pattern:
 * - Import this client in all AI generation functions
 * - Wrap calls with step.ai.wrap() for Inngest observability
 * - Use Structured Outputs (zodResponseFormat) for type-safe responses
 *
 * Environment:
 * - Requires OPENAI_API_KEY environment variable
 * - Configure in Vercel/Inngest dashboard
 *
 * Models Used:
 * - gpt-5-mini: Fast and cost-effective for content generation
 */
import OpenAI from 'openai';

// Fast and cost-effective model
export const BASE_OPENAI_MODEL = 'gpt-5-mini';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
