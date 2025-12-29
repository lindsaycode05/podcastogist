// Test-only runner for the mock pipeline paths.
// Executes pipeline logic synchronously with mocked step tools for deterministic tests.
import type { Id } from '@/convex/_generated/dataModel';
import { isMockPipeline } from '@/lib/_tests_/mock-flags';
import { runPodcastPipeline } from '@/lib/pipeline/podcast-processor-core';
import { runRetryJobPipeline } from '@/lib/pipeline/retry-job-core';
import { createMockStep } from '@/lib/pipeline/step-tools';
import type { JobName, PlanName } from '@/lib/tier-config';

const DEFAULT_PAUSE_MS = 150;

// Read mock pipeline delay with a sane fallback.
const getPauseMs = () => {
  const raw = process.env.MOCK_PIPELINE_DELAY_MS;
  const parsed = raw ? Number(raw) : DEFAULT_PAUSE_MS;
  return Number.isFinite(parsed) ? parsed : DEFAULT_PAUSE_MS;
};

// Run the full pipeline locally when mock mode is enabled.
export const queueMockPipeline = (data: {
  projectId: Id<'projects'>;
  fileUrl: string;
  plan: PlanName;
  userId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}) => {
  if (!isMockPipeline()) return;

  const step = createMockStep();
  const pauseMs = getPauseMs();

  void runPodcastPipeline({ event: { data }, step, pauseMs }).catch((error) => {
    console.error('Mock pipeline failed:', error);
  });
};

// Run a single retry job locally when mock mode is enabled.
export const queueMockRetryJob = (data: {
  projectId: Id<'projects'>;
  job: JobName;
  originalPlan?: PlanName;
  currentPlan?: PlanName;
}) => {
  if (!isMockPipeline()) return;

  const step = createMockStep();

  void runRetryJobPipeline({ event: { data }, step }).catch((error) => {
    console.error('Mock retry pipeline failed:', error);
  });
};
