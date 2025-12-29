// Client-side auth adapter that mirrors Clerk hooks/components and supports mock auth/plan cookies.
// Used by UI to stay deterministic in test mode without touching call sites.
'use client';

import {
  Protect as ClerkProtect,
  SignInButton as ClerkSignInButton,
  UserButton as ClerkUserButton,
  useAuth as clerkUseAuth
} from '@clerk/nextjs';
import type {
  CheckAuthorizationParamsWithCustomPermissions,
  CheckAuthorizationWithCustomPermissions
} from '@clerk/types';
import type { ComponentProps, ReactNode } from 'react';
import {
  getMockPlanClient,
  isMockAuthClient
} from '@/lib/_tests_/mock-flags-client';
import {
  type FeatureName,
  PLAN_FEATURES,
  type PlanName,
  PODCASTOGIST_USER_PLANS
} from '@/lib/tier-config';

type UseAuthReturn = ReturnType<typeof clerkUseAuth>;
type ClerkHasInput = CheckAuthorizationParamsWithCustomPermissions;
type SignedOutHas = (params: ClerkHasInput) => false;
type SignedInAuth = Extract<UseAuthReturn, { isSignedIn: true }>;
type ProtectFeature = NonNullable<ProtectProps['feature']>;

const MOCK_USER_ID = 'user_test_1';

// Read a cookie in the browser (undefined during SSR).
const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : undefined;
};

// Resolve the mock plan from cookies or fall back to the default mock plan.
const resolveMockPlan = (): PlanName => {
  const cookiePlan = getCookieValue('mock_plan');
  if (cookiePlan === PODCASTOGIST_USER_PLANS.FREE)
    return PODCASTOGIST_USER_PLANS.FREE;
  if (cookiePlan === PODCASTOGIST_USER_PLANS.PLUS)
    return PODCASTOGIST_USER_PLANS.PLUS;
  if (cookiePlan === PODCASTOGIST_USER_PLANS.MAX)
    return PODCASTOGIST_USER_PLANS.MAX;
  return getMockPlanClient();
};

// Resolve mock auth status from cookies.
const resolveMockAuth = (): boolean => {
  const cookieAuth = getCookieValue('mock_auth');
  if (cookieAuth === '0') return false;
  if (cookieAuth === '1') return true;
  return true;
};

// Emulate Clerk's has() using local plan/feature rules.
const buildMockHas =
  (plan: PlanName): CheckAuthorizationWithCustomPermissions =>
  (input: ClerkHasInput): boolean => {
    if ('feature' in input && input.feature) {
      return PLAN_FEATURES[plan].includes(input.feature as FeatureName);
    }
    if ('plan' in input && input.plan) return input.plan === plan;
    return false;
  };

// Signed-out has() always denies.
const buildSignedOutHas = (): SignedOutHas => (_input: ClerkHasInput) => false;

// Hook wrapper: returns Clerk auth or a deterministic mock.
export const useAuth = (): UseAuthReturn => {
  if (!isMockAuthClient()) {
    return clerkUseAuth();
  }

  const isSignedIn = resolveMockAuth();
  const plan = resolveMockPlan();
  const has = buildMockHas(plan);
  const signOut = async () => {};
  const getToken = async () => null;

  if (!isSignedIn) {
    return {
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      sessionClaims: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: buildSignedOutHas(),
      signOut,
      getToken
    };
  }

  return {
    isLoaded: true,
    isSignedIn: true,
    userId: MOCK_USER_ID,
    sessionId: 'session_test_1',
    sessionClaims: {} as SignedInAuth['sessionClaims'],
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has,
    signOut,
    getToken
  };
};

type ProtectProps = ComponentProps<typeof ClerkProtect>;

// Guard wrapper: delegates to Clerk or uses mock auth checks.
export const Protect = (props: ProtectProps) => {
  if (!isMockAuthClient()) {
    return <ClerkProtect {...props} />;
  }

  const { feature, condition, fallback, children } = props;
  const isSignedIn = resolveMockAuth();
  if (!isSignedIn) {
    return <>{fallback as ReactNode}</>;
  }

  const plan = resolveMockPlan();
  const has = buildMockHas(plan);

  const passesFeature = feature
    ? has({ feature: feature as ProtectFeature })
    : true;
  const passesCondition = condition ? condition(has) : true;
  const allowed = passesFeature && passesCondition;

  return <>{allowed ? children : (fallback as ReactNode)}</>;
};

type SignInButtonProps = ComponentProps<typeof ClerkSignInButton>;

// No-op sign-in UI in mock mode.
export const SignInButton = ({ children, ...props }: SignInButtonProps) => {
  if (!isMockAuthClient()) {
    return <ClerkSignInButton {...props}>{children}</ClerkSignInButton>;
  }

  return <>{children}</>;
};

type UserButtonProps = ComponentProps<typeof ClerkUserButton>;

// Hide user menu in mock mode.
export const UserButton = (props: UserButtonProps) => {
  if (!isMockAuthClient()) {
    return <ClerkUserButton {...props} />;
  }

  return null;
};
