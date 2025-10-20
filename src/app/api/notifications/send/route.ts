import { NextResponse } from 'next/server';

const AUTH_HEADER = 'authorization';

export async function POST(request: Request) {
  const token = process.env.NOTIFICATIONS_API_KEY;

  if (token) {
    const header = request.headers.get(AUTH_HEADER);
    if (header !== `Bearer ${token}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const payload = (await request.json()) as Partial<{
      title: unknown;
      message: unknown;
      type: unknown;
      userId: unknown;
    }>;

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object.' },
        { status: 400 },
      );
    }

    const { title, message, type, userId } = payload;

    if (typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required.' },
        { status: 400 },
      );
    }

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 },
      );
    }

    if (typeof type !== 'string' || !type.trim()) {
      return NextResponse.json(
        { error: 'Type is required.' },
        { status: 400 },
      );
    }

    if (typeof userId !== 'string' || !userId.trim()) {
      return NextResponse.json(
        { error: 'User ID is required.' },
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
