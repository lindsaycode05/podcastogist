// Server-side auth adapter with deterministic mock mode for tests.
// Exposes a minimal auth shape used across actions and RSCs.
import { auth as clerkAuth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { getMockPlan, isMockAuth } from '@/lib/_tests_/mock-flags';
import {
  type FeatureName,
  PLAN_FEATURES,
  type PlanName,
  PODCASTOGIST_USER_PLANS
} from '@/lib/tier-config';

type HasInput = { plan?: string; feature?: FeatureName };
type ClerkAuth = Awaited<ReturnType<typeof clerkAuth>>;
type ClerkHasInput = Parameters<ClerkAuth['has']>[0];

export interface AuthResult {
  userId: string | null;
  isAuthenticated: boolean;
  has?: (input?: HasInput) => boolean;
}

const MOCK_USER_ID = 'user_test_1';

// Read a cookie from the request context (safe during tests).
const getCookieValue = async (name: string): Promise<string | undefined> => {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
  } catch {
    return undefined;
  }
};

// Resolve mock plan from cookies or fall back to the default mock plan.
const resolveMockPlan = async (): Promise<PlanName> => {
  const cookiePlan = await getCookieValue('mock_plan');
  if (cookiePlan === PODCASTOGIST_USER_PLANS.FREE)
    return PODCASTOGIST_USER_PLANS.FREE;
  if (cookiePlan === PODCASTOGIST_USER_PLANS.PLUS)
    return PODCASTOGIST_USER_PLANS.PLUS;
  if (cookiePlan === PODCASTOGIST_USER_PLANS.MAX)
    return PODCASTOGIST_USER_PLANS.MAX;
  return getMockPlan();
};

// Resolve mock auth status from cookies.
const resolveMockAuth = async (): Promise<boolean> => {
  const cookieAuth = await getCookieValue('mock_auth');
  if (cookieAuth === '0') return false;
  if (cookieAuth === '1') return true;
  return true;
};

// Emulate Clerk's has() with local plan/feature rules.
const buildMockHas =
  (plan: PlanName) =>
  (input?: HasInput): boolean => {
    if (!input) return false;
    if (input.feature) return PLAN_FEATURES[plan].includes(input.feature);
    if (input.plan) return input.plan === plan;
    return false;
  };

// Auth wrapper used by server actions and server components.
export const auth = async (): Promise<AuthResult> => {
  // Delegate to Clerk when not in mock mode.
  if (!isMockAuth()) {
    const realAuth = await clerkAuth();
    const has = (input?: HasInput): boolean => {
      if (!input) return false;
      return realAuth.has(input as ClerkHasInput);
    };
    return {
      userId: realAuth.userId,
      isAuthenticated: Boolean(realAuth.userId),
      has
    };
  }

  // Mock auth path for deterministic tests.
  const isAuthenticated = await resolveMockAuth();
  const plan = await resolveMockPlan();

  return {
    userId: isAuthenticated ? MOCK_USER_ID : null,
    isAuthenticated,
    has: buildMockHas(plan)
  };
};
