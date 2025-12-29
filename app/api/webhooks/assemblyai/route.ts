/**
 * AssemblyAI Webhook Receiver
 *
 * Receives transcript status notifications from AssemblyAI and forwards them
 * to Inngest so workflows can resume without long-running HTTP requests.
 */
import { inngest } from '@/inngest/client';
import { ASSEMBLYAI_TRANSCRIPT_STATUS_EVENT } from '@/lib/events';
import { parseAssemblyAIWebhook } from '@/lib/providers/transcription-provider';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json(
      { ok: false, error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');

  if (!projectId) {
    return Response.json(
      { ok: false, error: 'Missing projectId' },
      { status: 400 }
    );
  }

  const webhookData = parseAssemblyAIWebhook(body);

  if (!webhookData) {
    return Response.json(
      { ok: false, error: 'Missing transcriptId or status' },
      { status: 400 }
    );
  }

  try {
    await inngest.send({
      name: ASSEMBLYAI_TRANSCRIPT_STATUS_EVENT,
      data: {
        projectId,
        transcriptId: webhookData.transcriptId,
        status: webhookData.status,
        error: webhookData.error
      }
    });
  } catch (sendError) {
    console.error('Failed to forward AssemblyAI webhook to Inngest', sendError);
    return Response.json(
      { ok: false, error: 'Failed to forward webhook' },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
