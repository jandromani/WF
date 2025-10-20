import {
  type ISuccessResult,
  type IVerifyResponse,
  verifyCloudProof,
} from '@worldcoin/minikit-js';

const hasProofFields = (payload: ISuccessResult) => {
  const maybeRoot =
    (payload as unknown as { merkle_root?: string }).merkle_root ??
    (payload as unknown as { root?: string }).root;

  return Boolean(payload?.nullifier_hash && payload?.proof && maybeRoot);
};

export const validateWorldIdProof = async ({
  payload,
  action,
  signal,
}: {
  payload: ISuccessResult;
  action: string;
  signal?: string;
}): Promise<IVerifyResponse> => {
  if (!hasProofFields(payload)) {
    throw new Error('Incomplete World ID proof');
  }

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

  return verification;
};

export type WorldIDProof = ISuccessResult;

const isSuccessPayload = (
  payload: Parameters<typeof verifyCloudProof>[0] | ISuccessResult,
): payload is ISuccessResult =>
  'status' in payload ? payload.status === 'success' : true;

export const postProof = async (proof: {
  payload: Parameters<typeof verifyCloudProof>[0] | ISuccessResult;
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
