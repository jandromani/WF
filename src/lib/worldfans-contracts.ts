import WorldFansPay from '@/abi/TestContract.json';
import type { Abi } from 'viem';

export type ContractKey = 'pay';

type ContractConfig = {
  address: `0x${string}`;
  abi: Abi;
};

const FALLBACK_PAY_CONTRACT =
  '0xF0882554ee924278806d708396F1a7975b732522' as const;

const resolveAddress = (envKey: string, fallback: `0x${string}`) => {
  const envValue = process.env[envKey];
  if (envValue && envValue.startsWith('0x')) {
    return envValue as `0x${string}`;
  }
  return fallback;
};

export const worldFansContracts: Record<ContractKey, ContractConfig> = {
  pay: {
    address: resolveAddress('NEXT_PUBLIC_PAY_ADDRESS', FALLBACK_PAY_CONTRACT),
    abi: WorldFansPay as Abi,
  },
};

export const getContractConfig = (key: ContractKey): ContractConfig =>
  worldFansContracts[key];
