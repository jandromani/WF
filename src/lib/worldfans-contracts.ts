import WorldFansData from '@/abi/WorldFansData.json';
import WorldFansPay from '@/abi/TestContract.json';
import WorldFansToken from '@/abi/WorldFansToken.json';
import WorldFansTreasury from '@/abi/WorldFansTreasury.json';
import { env, ensureAddress } from '@/lib/env';
import type { Abi } from 'viem';

export type ContractKey = 'pay';

type ContractConfig = {
  address: `0x${string}`;
  abi: Abi;
};

export const addresses = {
  token: ensureAddress(
    env.contracts.token,
    '0x0000000000000000000000000000000000000000',
  ),
  treasury: ensureAddress(
    env.contracts.treasury,
    '0x0000000000000000000000000000000000000000',
  ),
  data: ensureAddress(
    env.contracts.data,
    '0x0000000000000000000000000000000000000000',
  ),
  pay: ensureAddress(
    env.contracts.pay,
    '0xF0882554ee924278806d708396F1a7975b732522',
  ),
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
