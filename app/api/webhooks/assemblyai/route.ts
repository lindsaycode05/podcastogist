/**
 * AssemblyAI Webhook Receiver
 *
 * Receives transcript status notifications from AssemblyAI and forwards them
 * to Inngest so workflows can resume without long-running HTTP requests.
 */
import { inngest } from '@/inngest/client';
import { ASSEMBLYAI_TRANSCRIPT_STATUS_EVENT } from '@/lib/events';

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

  const transcriptId =
    (body.transcript_id as string | undefined) ||
    (body.transcriptId as string | undefined) ||
    (body.id as string | undefined);
  const status = body.status as string | undefined;
  const error = body.error as string | undefined;

  if (!transcriptId || !status) {
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
        transcriptId,
        status,
        error,
      },
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
