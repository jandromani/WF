import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { validateWorldIdProof } from '@/lib/worldid';

interface IRequestPayload {
  payload: Parameters<typeof validateWorldIdProof>[0]['payload'];
  action: string;
  signal?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    const ip =
      req.headers.get('x-forwarded-for') ??
      req.headers.get('x-real-ip') ??
      null;

    const verifyRes = await validateWorldIdProof({
      payload,
      action,
      signal,
      ip,
    });

    return NextResponse.json({ verifyRes }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to verify World ID proof';
    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}
