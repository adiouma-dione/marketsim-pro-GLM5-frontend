// ============================================================
// MarketSim Pro - SSE Proxy Route Handler
// ============================================================

import { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  // Get auth token from cookie
  const authToken = request.cookies.get('auth-token')?.value;

  if (!authToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Forward SSE request to backend
  const backendUrl = `${API_URL}/api/v1/sessions/${sessionId}/simulation-status`;

  try {
    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'text/event-stream',
      },
    });

    if (!response.ok) {
      return new Response(`Backend error: ${response.status}`, {
        status: response.status,
      });
    }

    if (!response.body) {
      return new Response('No response body', { status: 500 });
    }

    // Create a TransformStream to pipe SSE data
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            controller.enqueue(value);
          }
        } catch (error) {
          console.error('SSE stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE proxy error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
