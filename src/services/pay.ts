'use client';

import WorldFansToken from '@/abi/WorldFansToken.json';
import { env } from '@/lib/env';
import { toTokenUnits } from '@/lib/hooks/useWorldChainWallet';
import { getWalletClient, publicClient, worldChain } from '@/lib/worldchain/client';
import { addresses } from '@/lib/worldfans-contracts';
import { Activity, recordActivity } from '@/services/wallet';
import type { Abi } from 'viem';

export interface PayOptions {
  amount: number;
  memo: string;
  type: 'subscribe' | 'tip' | 'unlock';
  description?: string;
}

const tokenAbi = (WorldFansToken as { abi: Abi }).abi;

const ensureTokenAddress = () => {
  if (!env.contracts.token) {
    throw new Error('Dirección del token WFANS no configurada');
  }
  return env.contracts.token;
};

const executeApprove = async (amount: bigint) => {
  const tokenAddress = ensureTokenAddress();
  if (!addresses.pay || addresses.pay === '0x0000000000000000000000000000000000000000') {
    throw new Error('Dirección del contrato de pagos no configurada');
  }
  const wallet = await getWalletClient();
  await wallet.switchChain({ id: worldChain.id });
  const accounts = await wallet.requestAddresses();
  if (!accounts.length) {
    throw new Error('Conecta tu wallet para autorizar el gasto');
  }
  const hash = await wallet.writeContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: 'approve',
    args: [addresses.pay, amount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
};

const executeTransfer = async (amount: bigint) => {
  const tokenAddress = ensureTokenAddress();
  if (!addresses.pay || addresses.pay === '0x0000000000000000000000000000000000000000') {
    throw new Error('Dirección del contrato de pagos no configurada');
  }
  const wallet = await getWalletClient();
  await wallet.switchChain({ id: worldChain.id });
  const accounts = await wallet.requestAddresses();
  if (!accounts.length) {
    throw new Error('Conecta tu wallet para transferir WFANS');
  }
  const hash = await wallet.writeContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: 'transfer',
    args: [addresses.pay, amount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
};

export async function pay({ amount, memo, type, description }: PayOptions) {
  if (amount <= 0) {
    throw new Error('El monto debe ser mayor a cero');
  }
  const units = toTokenUnits(amount);

  await executeApprove(units);
  const hash = await executeTransfer(units);

  await recordActivity({
    type,
    amount,
    meta: description ?? memo,
    id: '',
    ts: Date.now(),
  } as Activity);

  return { status: 'success', hash } as const;
}
