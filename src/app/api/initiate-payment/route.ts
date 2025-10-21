import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { amount, memo } = await req.json().catch(() => ({}));
  if (typeof amount !== 'number') {
    return NextResponse.json({ error: 'amount required' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, memo: memo ?? null });
}
