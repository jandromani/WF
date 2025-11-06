import { LOGIN_ACTION_ID } from '@/auth/config';
import { postProof } from '@/lib/worldid';
import type { ISuccessResult } from '@worldcoin/idkit';
import { signIn } from 'next-auth/react';

interface WalletAuthOptions {
  result: ISuccessResult;
  sessionDurationMinutes: number;
  walletAddress?: string | null;
}

export const walletAuth = async ({
  result,
  sessionDurationMinutes,
  walletAddress,
}: WalletAuthOptions) => {
  await postProof({
    payload: result,
    action: LOGIN_ACTION_ID,
  });

  const response = await signIn('credentials', {
    redirectTo: '/home',
    proof: result.proof,
    merkleRoot: result.merkle_root,
    nullifierHash: result.nullifier_hash,
    verificationLevel: result.verification_level,
    walletAddress: walletAddress ?? '',
    sessionDuration: sessionDurationMinutes.toString(),
  });

  if (response?.error) {
    throw new Error(response.error);
  }

  if (!response?.ok) {
    throw new Error('World ID sign in failed');
  }

  return response;
};
