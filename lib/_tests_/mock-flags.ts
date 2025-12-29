// Server-side helpers for test/mock feature flags.
// These read server env vars for deterministic providers and pipeline behavior.
import { type PlanName, PODCASTOGIST_USER_PLANS } from '@/lib/tier-config';

// Normalize plan strings to known plan constants.
const normalizePlan = (value?: string): PlanName => {
  if (value === PODCASTOGIST_USER_PLANS.PLUS)
    return PODCASTOGIST_USER_PLANS.PLUS;
  if (value === PODCASTOGIST_USER_PLANS.MAX) return PODCASTOGIST_USER_PLANS.MAX;
  return PODCASTOGIST_USER_PLANS.FREE;
};

// Mock flag toggles for server logic.
export const isMockAuth = () => process.env.MOCK_AUTH === '1';
export const isMockAI = () => process.env.MOCK_AI === '1';
export const isMockTranscription = () => process.env.MOCK_TRANSCRIPTION === '1';
export const isMockPipeline = () => process.env.MOCK_PIPELINE === '1';

// Resolve the mock plan from an override or environment.
export const getMockPlan = (override?: string): PlanName =>
  normalizePlan(override || process.env.MOCK_PLAN);
