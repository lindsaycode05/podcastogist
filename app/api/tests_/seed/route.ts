// Test-only seed endpoint for deterministic E2E fixtures.

import { anyApi } from 'convex/server';
import { NextResponse } from 'next/server';
import { convex } from '@/lib/convex-client';

type SeedRequest = {
  variant?: 'demo' | 'error';
};

// Allow in mock auth or test mode only.
const isTestMode = () =>
  process.env.MOCK_AUTH === '1' || process.env.NODE_ENV === 'test';

// Seed a demo or error project via Convex when permitted.
export async function POST(request: Request) {
  if (!isTestMode()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  // Parse request body defensively; default to demo variant.
  let body: SeedRequest = {};
  try {
    body = (await request.json()) as SeedRequest;
  } catch {
    body = {};
  }

  const variant = body.variant === 'error' ? 'error' : 'demo';
  const mutation =
    variant === 'error'
      ? anyApi._tests_.seedErrorProject
      : anyApi._tests_.seedDemoProject;

  const result = await convex.mutation(mutation, {});
  return NextResponse.json({ ok: true, result });
}
