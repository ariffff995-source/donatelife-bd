import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserStrict, registerSseClient, unregisterSseClient } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserStrict(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized live stream access.' }, { status: 401 });
    }

    let controllerRef: ReadableStreamDefaultController | null = null;
    const stream = new ReadableStream({
      start(controller) {
        controllerRef = controller;
        registerSseClient(user.id, controller);
      },
      cancel() {
        if (controllerRef) {
          unregisterSseClient(user.id, controllerRef);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('SSE connection error:', err);
    return NextResponse.json({ error: 'Internal server error in SSE.' }, { status: 500 });
  }
}
