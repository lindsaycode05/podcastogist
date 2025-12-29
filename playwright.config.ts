import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
const convexURL = process.env.NEXT_PUBLIC_CONVEX_URL || 'http://127.0.0.1:3210';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'pnpm playwright:test:e2e',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
      CONVEX_AGENT_MODE: 'anonymous',
      MOCK_AUTH: '1',
      NEXT_PUBLIC_MOCK_AUTH: '1',
      MOCK_PLAN: 'free',
      NEXT_PUBLIC_MOCK_PLAN: 'free',
      MOCK_PIPELINE: '1',
      NEXT_PUBLIC_MOCK_PIPELINE: '1',
      MOCK_PIPELINE_DELAY_MS: '200',
      MOCK_AI: '1',
      MOCK_TRANSCRIPTION: '1',
      NEXT_PUBLIC_APP_URL: baseURL,
      NEXT_PUBLIC_CONVEX_URL: convexURL
    }
  }
});
