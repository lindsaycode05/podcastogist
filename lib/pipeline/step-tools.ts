// Thin wrapper around Inngest step tooling used across the pipeline.
// Keeps our helpers typed while allowing a lightweight mock implementation in tests.
import type { GetStepTools } from 'inngest';

// Derive step types from the configured Inngest client.
type InngestStepTools = GetStepTools<typeof import('@/inngest/client').inngest>;

// Minimal subset of step tools used by our pipeline steps.
export type StepTools = Pick<InngestStepTools, 'run'> & {
  ai: Pick<InngestStepTools['ai'], 'wrap'>;
  waitForEvent?: InngestStepTools['waitForEvent'];
};

// Mock step tools for tests and local mock pipeline runs.
export const createMockStep = (): StepTools => {
  const run: StepTools['run'] = async (_idOrOptions, fn, ...input) =>
    // biome-ignore lint: input passed to the inggest step varies widely
    (await (fn as (...args: any[]) => any)(...input)) as any;
  const wrap: StepTools['ai']['wrap'] = async (_idOrOptions, fn, ...input) =>
    // biome-ignore lint: input passed to the inggest step varies widely
    (await (fn as (...args: any[]) => any)(...input)) as any;
  const waitForEvent: StepTools['waitForEvent'] = async () => {
    throw new Error('waitForEvent is not available in mock mode');
  };

  return {
    run,
    ai: { wrap },
    waitForEvent
  };
};
