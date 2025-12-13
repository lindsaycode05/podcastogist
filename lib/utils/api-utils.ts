import { NextResponse } from 'next/server';

/**
 * Standardized API error response helper
 *
 * Returns NextResponse with error message and status code.
 * Format: { error: string }
 *
 * @param message - Error message for client
 * @param status - HTTP status code (default: 500)
 * @returns NextResponse with error body
 */
export const apiError = (message: string, status = 500): NextResponse => {
  return NextResponse.json({ error: message }, { status });
};
