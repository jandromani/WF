import { NextResponse } from 'next/server';

type Body = { merkle_root: string; nullifier_hash: string; proof: string; action?: string };

const memNullifiers = new Set<string>();
const memHits: Record<string, { count: number; ts: number }> = {};

function isRateLimited(ip: string) {
  const now = Date.now();
  const rec = memHits[ip] ?? { count: 0, ts: now };
  if (now - rec.ts > 60_000) {
    memHits[ip] = { count: 1, ts: now };
    return false;
  }
  rec.count += 1;
  memHits[ip] = rec;
  return rec.count > 10;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body = (await req.json()) as Partial<Body>;
  const { merkle_root, nullifier_hash, proof } = body;

  if (!merkle_root || !nullifier_hash || !proof) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  if (memNullifiers.has(nullifier_hash)) {
    return NextResponse.json({ error: 'replay_detected' }, { status: 409 });
  }

  memNullifiers.add(nullifier_hash);
  return NextResponse.json({ ok: true });
}
