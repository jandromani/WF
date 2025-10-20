import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { nullifierStore } from '@/lib/nullifier-store';
import { validateWorldIdProof, type WorldIDProof } from '@/lib/worldid';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

const nonEmptyString = z
  .string()
  .trim()
  .min(1, 'Value cannot be empty.');

const hex32String = z
  .string()
  .regex(/^0x[a-f0-9]{64}$/i, 'Expected a 32-byte hex string.');

const proofSchema = z
  .object({
    nullifier_hash: hex32String,
    proof: z.string().min(1, 'Proof is required.'),
    merkle_root: hex32String.optional(),
    root: hex32String.optional(),
  })
  .passthrough()
  .superRefine((payload, ctx) => {
    if (!payload.merkle_root && !payload.root) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'root is required.',
        path: ['root'],
      });
    }
  })
  .transform((payload) => {
    const merkleRoot = payload.merkle_root ?? payload.root!;
    const sanitized = { ...payload, merkle_root: merkleRoot };
    delete (sanitized as { root?: string }).root;
    return sanitized;
  });

const requestSchema = z.object({
  payload: proofSchema,
  action: nonEmptyString,
  signal: nonEmptyString.optional(),
});

const getClientIp = (req: NextRequest): string | null =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
  req.headers.get('x-real-ip') ??
  req.ip ??
  null;

const consumeRateLimit = (ip: string) => {
  const now = Date.now();
  const existing = ipRateLimit.get(ip);

  if (!existing || existing.resetAt <= now) {
    ipRateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  ipRateLimit.set(ip, existing);
  return true;
};

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  if (clientIp && !consumeRateLimit(clientIp)) {
    // Explicit 429 payload for rate limit breaches.
    return NextResponse.json(
      {
        error: 'Too many verification attempts from this IP. Please try again later.',
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    // Explicit 400 payload when the request body cannot be parsed.
    return NextResponse.json(
      {
        error: 'Request body must be valid JSON.',
      },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    // Explicit 400 payload when validation fails.
    return NextResponse.json(
      {
        error: 'Invalid World ID verification payload.',
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { payload, action, signal } = parsed.data;
  const proofPayload = payload as WorldIDProof;

  if (await nullifierStore.has(proofPayload.nullifier_hash)) {
    // Explicit 409 payload for replayed proofs.
    return NextResponse.json(
      {
        error: 'This proof has already been submitted.',
        nullifier_hash: proofPayload.nullifier_hash,
      },
      { status: 409 },
    );
  }

  try {
    const verifyRes = await validateWorldIdProof({
      payload: proofPayload,
      action,
      signal,
    });

    await nullifierStore.add(proofPayload.nullifier_hash);

    // Explicit 200 payload on success.
    return NextResponse.json(
      {
        status: 'ok',
        action,
        nullifier_hash: proofPayload.nullifier_hash,
        verification: verifyRes,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to verify World ID proof';

    // Explicit 400 payload for verification failures.
    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}
