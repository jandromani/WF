import WorldFansData from '@/abi/WorldFansData.json';
import WorldFansPay from '@/abi/TestContract.json';
import WorldFansToken from '@/abi/WorldFansToken.json';
import WorldFansTreasury from '@/abi/WorldFansTreasury.json';
import type { Abi } from 'viem';

export type ContractKey = 'pay';

type ContractConfig = {
  address: `0x${string}`;
  abi: Abi;
};

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;
const FALLBACK_PAY_CONTRACT =
  '0xF0882554ee924278806d708396F1a7975b732522' as const;

const resolveAddress = (envKey: string, fallback: `0x${string}`) => {
  const envValue = process.env[envKey];
  if (envValue && envValue.startsWith('0x')) {
    return envValue as `0x${string}`;
  }
  return fallback;
};

export const addresses = {
  token: resolveAddress('NEXT_PUBLIC_TOKEN_ADDRESS', ZERO_ADDRESS),
  treasury: resolveAddress('NEXT_PUBLIC_TREASURY_ADDRESS', ZERO_ADDRESS),
  data: resolveAddress('NEXT_PUBLIC_TOKEN_DATA_ADDRESS', ZERO_ADDRESS),
  pay: resolveAddress('NEXT_PUBLIC_PAY_ADDRESS', FALLBACK_PAY_CONTRACT),
} as const;

export const abis = {
  token: WorldFansToken as Abi,
  treasury: WorldFansTreasury as Abi,
  data: WorldFansData as Abi,
  pay: WorldFansPay as Abi,
} as const;

export const worldFansContracts: Record<ContractKey, ContractConfig> = {
  pay: {
    address: addresses.pay,
    abi: abis.pay,
  },
};

export const getContractConfig = (key: ContractKey): ContractConfig =>
  worldFansContracts[key];
