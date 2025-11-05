import {
  type ISuccessResult,
  type IVerifyResponse,
  verifyCloudProof,
} from '@worldcoin/idkit';

export const validateWorldIdProof = async ({
  payload,
  action,
  signal,
}: {
  payload: ISuccessResult;
  action: string;
  signal?: string;
}): Promise<IVerifyResponse> => {
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

export const postProof = async (proof: {
  payload: ISuccessResult;
  action: string;
  signal?: string;
}) => {
  const res = await fetch('/api/verify-proof', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: proof.action,
      signal: proof.signal,
      merkle_root: proof.payload.merkle_root,
      nullifier_hash: proof.payload.nullifier_hash,
      proof: proof.payload.proof,
      verification_level: proof.payload.verification_level,
    }),
  });

  if (!res.ok) {
    throw new Error('World ID verify failed');
  }

  return res.json();
};
