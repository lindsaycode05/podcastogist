// Integration tests for transcription webhook parsing using Vitest.
// Strategy: feed realistic webhook payloads into the mapping helper.
// This validates provider boundary behavior without hitting external APIs.
// We cover normal payloads, alternate keys, and missing fields.
// Failures imply a breaking change in webhook parsing assumptions.
import { describe, expect, it } from 'vitest';
import { parseAssemblyAIWebhook } from '@/lib/providers/transcription-provider';

describe('assemblyai webhook mapping', () => {
  // Validates the happy-path mapping from AssemblyAI's webhook fields.
  // This is the main path used when a transcript completes.
  it('extracts transcript fields from webhook payload', () => {
    const payload = {
      transcript_id: 'transcript_abc',
      status: 'completed'
    };

    expect(parseAssemblyAIWebhook(payload)).toEqual({
      transcriptId: 'transcript_abc',
      status: 'completed',
      error: undefined
    });
  });

  // Handles alternative key names observed in webhook payloads.
  // This ensures we stay resilient to provider field variants.
  it('handles alternate transcript id keys', () => {
    const payload = {
      id: 'transcript_xyz',
      status: 'error',
      error: 'failed'
    };

    expect(parseAssemblyAIWebhook(payload)).toEqual({
      transcriptId: 'transcript_xyz',
      status: 'error',
      error: 'failed'
    });
  });

  // Ensures we return null when required identifiers are missing.
  // This prevents downstream steps from running with partial data.
  it('returns null when required fields are missing', () => {
    const payload = { status: 'completed' };
    expect(parseAssemblyAIWebhook(payload)).toBeNull();
  });
});
