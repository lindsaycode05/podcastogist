// Client-side helpers for test/mock feature flags.
// These read NEXT_PUBLIC_* flags so UI can run deterministically in E2E/dev.
'use client';

import { type PlanName, PODCASTOGIST_USER_PLANS } from '@/lib/tier-config';

// Normalize plan strings to known plan constants.
const normalizePlan = (value?: string): PlanName => {
  if (value === PODCASTOGIST_USER_PLANS.PLUS)
    return PODCASTOGIST_USER_PLANS.PLUS;
  if (value === PODCASTOGIST_USER_PLANS.MAX) return PODCASTOGIST_USER_PLANS.MAX;
  return PODCASTOGIST_USER_PLANS.FREE;
};

// Toggle mock auth mode in the browser.
export const isMockAuthClient = () => process.env.NEXT_PUBLIC_MOCK_AUTH === '1';

// Toggle mock pipeline mode in the browser.
export const isMockPipelineClient = () =>
  process.env.NEXT_PUBLIC_MOCK_PIPELINE === '1';

// Resolve the mock plan from an override or environment.
export const getMockPlanClient = (override?: string): PlanName =>
  normalizePlan(override || process.env.NEXT_PUBLIC_MOCK_PLAN);
