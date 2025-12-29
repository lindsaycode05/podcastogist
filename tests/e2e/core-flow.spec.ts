// End-to-end tests for core user flows using Playwright against the real app.
// Strategy: black-box HTTP and DOM validation with deterministic mocks.
// We seed Convex via test-only endpoints and set mock auth/plan cookies.
// Coverage includes auth gating, project creation, uploads, and pipeline status updates.
// We also verify plan gating UI, mobile navigation, and retry behavior.
// External providers are mocked, but routing, rendering, and Convex real-time DB mutations are real.
// This keeps CI deterministic while still exercising production wiring.

import path from 'node:path';
import type { APIRequestContext, BrowserContext } from '@playwright/test';
import { expect, test } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

// Set mock auth/plan cookies for the current browser context.
const setMockCookies = async (
  context: BrowserContext,
  options: { auth?: string; plan?: string } = {}
) => {
  const auth = options.auth ?? '1';
  const plan = options.plan ?? 'free';

  await context.addCookies([
    { name: 'mock_auth', value: auth, url: baseURL },
    { name: 'mock_plan', value: plan, url: baseURL }
  ]);
};

// Small helper used for reset/seed retries.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Reset Convex state and seed a deterministic project fixture.
const resetAndSeed = async (
  request: APIRequestContext,
  variant: 'demo' | 'error' = 'demo'
) => {
  const attempts = 20;

  for (let i = 0; i < attempts; i += 1) {
    try {
      const resetResponse = await request.post('/api/tests_/reset');
      if (!resetResponse.ok()) {
        throw new Error(`Reset failed (${resetResponse.status()})`);
      }

      const seedResponse = await request.post('/api/tests_/seed', {
        data: { variant }
      });
      if (!seedResponse.ok()) {
        throw new Error(`Seed failed (${seedResponse.status()})`);
      }

      const seedJson = (await seedResponse.json()) as {
        result?: { projectId?: string };
      };
      return seedJson.result?.projectId || '';
    } catch (error) {
      if (i === attempts - 1) throw error;
      await sleep(500);
    }
  }

  return '';
};

// Serial execution avoids cross-test data races on the shared Convex state.
test.describe.configure({ mode: 'serial' });

let demoProjectId = '';

test.beforeEach(async ({ context, request }) => {
  await setMockCookies(context, { auth: '1', plan: 'free' });
  demoProjectId = await resetAndSeed(request, 'demo');
});

// Asserts that unauthenticated users are redirected away from the dashboard.
// This protects the auth gate on the projects area.
test('auth gate blocks unauthenticated access to projects', async ({
  context,
  page
}) => {
  await setMockCookies(context, { auth: '0', plan: 'free' });
  await page.goto('/dashboard/projects');
  await expect(page).toHaveURL('/');
});

// Walks the happy path of uploading a file and seeing it surface in projects.
// This validates the create-project flow from UI input to dashboard list.
test('sign in -> create project -> project appears in dashboard', async ({
  page
}) => {
  await page.goto('/dashboard/upload');

  const filePath = path.join(
    process.cwd(),
    'tests',
    'foundation',
    'fixtures',
    'sample.mp3'
  );

  await page.setInputFiles('input[type="file"]', filePath);
  await page.getByRole('button', { name: 'Start Upload' }).click();

  await page.waitForURL(/\/dashboard\/projects\/.+/);
  await expect(
    page.getByRole('heading', { name: /sample\.mp3/i }).first()
  ).toBeVisible();

  await page.goto('/dashboard/projects');
  await expect(page.getByText(/sample\.mp3/i)).toBeVisible();
});

// Exercises the upload pipeline and checks processing status transitions in the UI.
// This proves the mocked providers still drive real state changes.
test('upload flow shows processing transitions and completes', async ({
  page
}) => {
  await page.goto('/dashboard/upload');

  const filePath = path.join(
    process.cwd(),
    'tests',
    'foundation',
    'fixtures',
    'sample.mp3'
  );

  await page.setInputFiles('input[type="file"]', filePath);
  await page.getByRole('button', { name: 'Start Upload' }).click();

  await page.waitForURL(/\/dashboard\/projects\/.+/);
  await expect(
    page.getByText(/AI is processing|Getting your analysis ready/i)
  ).toBeVisible();
  await expect(page.getByText('Analysis finished!')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'TL;DR' })).toBeVisible();
});

// Confirms that Max-only content is gated behind an upgrade CTA on free plans.
// This is the upsell boundary for premium pipeline outputs.
test('max-only tab shows upgrade CTA on free plan', async ({ page }) => {
  await page.goto(`/dashboard/projects/${demoProjectId}`);
  await page.getByRole('tab', { name: /YouTube Timestamps/i }).click();
  await expect(
    page.getByRole('heading', { name: /YouTube Timestamps Locked/i })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Upgrade to Max/i })
  ).toBeVisible();
});

// Verifies that the tab selector works on a small viewport.
// This catches mobile navigation regressions for core content tabs.
test('mobile viewport supports tab navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`/dashboard/projects/${demoProjectId}`);

  const selectTrigger = page.getByRole('combobox');
  await selectTrigger.click();
  await page.getByRole('option', { name: /Titles/i }).click();
  await expect(
    page.getByRole('heading', { name: /Titles Locked/i })
  ).toBeVisible();
});

// Creates a known failure state and confirms the retry path regenerates outputs.
// This validates the recovery flow without running real workers.
test('retry flow regenerates a failed job', async ({
  context,
  page,
  request
}) => {
  await setMockCookies(context, { auth: '1', plan: 'plus' });
  const errorProjectId = await resetAndSeed(request, 'error');

  await page.goto(`/dashboard/projects/${errorProjectId}`);
  await page.getByRole('tab', { name: /Social Posts/i }).click();
  await expect(page.getByText('Generation Failed')).toBeVisible();

  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText(/Podcastogist turns 1 upload/i)).toBeVisible();
});
