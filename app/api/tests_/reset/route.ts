// Test-only reset endpoint for deterministic E2E state.

import { anyApi } from 'convex/server';
import { NextResponse } from 'next/server';
import { convex } from '@/lib/convex-client';

// Allow in mock auth or test mode only.
const isTestMode = () =>
  process.env.MOCK_AUTH === '1' || process.env.NODE_ENV === 'test';

// Reset test data via Convex when permitted.
export async function POST() {
  if (!isTestMode()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const result = await convex.mutation(anyApi._tests_.reset, {});
  return NextResponse.json({ ok: true, result });
}
