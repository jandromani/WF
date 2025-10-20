import { NextResponse } from 'next/server';

const AUTH_HEADER = 'authorization';

export async function POST(request: Request) {
  const token = process.env.NOTIFICATIONS_API_KEY;
  if (!token) {
    return NextResponse.json(
      { error: 'Notifications API key not configured' },
      { status: 500 },
    );
  }

  const header = request.headers.get(AUTH_HEADER);
  if (header !== `Bearer ${token}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      title: string;
      body?: string;
    };

    if (!body?.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 },
      );
    }

    // TODO: Integrate with MiniKit server utilities when available.
    // For now we simply acknowledge the request so the client can
    // proceed with its own notification handling strategy.
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to process notification';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
