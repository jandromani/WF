import {
  type ISuccessResult,
  type IVerifyResponse,
  type MiniAppVerifyActionPayload,
  verifyCloudProof,
} from '@worldcoin/minikit-js';

type RateLimitState = {
  count: number;
  expiresAt: number;
};

type RateLimitKey = 'ip' | 'wallet';

type ValidateParams = {
  payload: ISuccessResult;
  action: string;
  signal?: string;
  ip?: string | null;
};

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const nullifierCache = new Set<string>();
const rateLimiters: Record<RateLimitKey, Map<string, RateLimitState>> = {
  ip: new Map(),
  wallet: new Map(),
};

const getIdentifier = (payload: ISuccessResult): string | undefined => {
  const maybeWallet = (payload as unknown as { wallet_address?: string })
    ?.wallet_address;
  if (maybeWallet && maybeWallet.startsWith('0x')) {
    return maybeWallet.toLowerCase();
  }
  const maybeSignal = (payload as unknown as { signal?: string })?.signal;
  return maybeSignal?.toLowerCase();
};

const assertRateLimit = (key: RateLimitKey, identifier?: string, ip?: string) => {
  const map = rateLimiters[key];
  const value = key === 'ip' ? ip : identifier;
  if (!value) {
    return;
  }
  const existing = map.get(value);
  const now = Date.now();
  if (!existing || existing.expiresAt < now) {
    map.set(value, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw new Error('Rate limit exceeded');
  }

  existing.count += 1;
  map.set(value, existing);
};

export const validateWorldIdProof = async ({
  payload,
  action,
  signal,
  ip,
}: ValidateParams): Promise<IVerifyResponse> => {
  if (!payload?.nullifier_hash || !payload?.merkle_root || !payload?.proof) {
    throw new Error('Incomplete World ID proof');
  }

  if (nullifierCache.has(payload.nullifier_hash)) {
    throw new Error('Proof already used');
  }

  const identifier = getIdentifier(payload);

  assertRateLimit('ip', undefined, ip ?? undefined);
  assertRateLimit('wallet', identifier, ip ?? undefined);

  const appId = process.env.NEXT_PUBLIC_APP_ID as `app_${string}` | undefined;
  if (!appId) {
    throw new Error('NEXT_PUBLIC_APP_ID is not configured');
  }

  const verification = (await verifyCloudProof(
    payload,
    appId,
    action,
    signal,
  )) as IVerifyResponse;

  if (!verification.success) {
    throw new Error(verification.detail ?? 'World ID verification failed');
  }

  nullifierCache.add(payload.nullifier_hash);

  return verification;
};

export type WorldIDProof = ISuccessResult;

const isSuccessPayload = (
  payload: MiniAppVerifyActionPayload | ISuccessResult,
): payload is ISuccessResult =>
  'status' in payload ? payload.status === 'success' : true;

export const postProof = async (proof: {
  payload: MiniAppVerifyActionPayload | ISuccessResult;
  action: string;
  signal?: string;
}) => {
  if (!isSuccessPayload(proof.payload)) {
    throw new Error('World ID verification failed before submitting proof');
  }

  const res = await fetch('/api/verify-proof', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...proof, payload: proof.payload }),
  });

  if (!res.ok) {
    throw new Error('World ID verify failed');
  }

  return res.json();
};
