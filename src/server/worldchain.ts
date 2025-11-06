import { createPublicClient, createWalletClient, defineChain, http, Hex, encodeFunctionData, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { config } from './config.js';

export const worldChain = defineChain({
  id: 4801,
  name: 'Worldchain',
  network: 'worldchain',
  nativeCurrency: {
    name: 'World Chain Token',
    symbol: 'WLD',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [config.worldchain.rpcUrl] },
    public: { http: [config.worldchain.rpcUrl] },
  },
});

export const publicClient = createPublicClient({
  chain: worldChain,
  transport: http(config.worldchain.rpcUrl),
});

export const wfansAbi = [
  {
    type: 'function',
    name: 'tip',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'creator', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'comment', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'subscribe',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'creator', type: 'address' },
      { name: 'tierId', type: 'uint256' },
      { name: 'months', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

export type TipPayload = {
  creatorAddress: Hex;
  amount: string;
  comment?: string;
  from: Hex;
  gasPriceGwei?: number;
};

export type SubscribePayload = {
  creatorAddress: Hex;
  tierId: bigint;
  months: bigint;
  from: Hex;
  gasPriceGwei?: number;
};

export const buildTipTransaction = ({ creatorAddress, amount, comment = '', from, gasPriceGwei }: TipPayload) => {
  const data = encodeFunctionData({
    abi: wfansAbi,
    functionName: 'tip',
    args: [creatorAddress, parseUnits(amount, 18), comment],
  });

  return {
    to: config.worldchain.wfansAddress as Hex,
    data,
    chainId: worldChain.id,
    account: from,
    gasPrice: gasPriceGwei ? parseUnits(String(gasPriceGwei), 9) : undefined,
  } as const;
};

export const buildSubscribeTransaction = ({ creatorAddress, tierId, months, from, gasPriceGwei }: SubscribePayload) => {
  const data = encodeFunctionData({
    abi: wfansAbi,
    functionName: 'subscribe',
    args: [creatorAddress, tierId, months],
  });

  return {
    to: config.worldchain.wfansAddress as Hex,
    data,
    chainId: worldChain.id,
    account: from,
    gasPrice: gasPriceGwei ? parseUnits(String(gasPriceGwei), 9) : undefined,
  } as const;
};

export const maybeCreateRelayer = () => {
  if (!config.relayer.privateKey) {
    return null;
  }

  const account = privateKeyToAccount(config.relayer.privateKey as Hex);

  return createWalletClient({
    chain: worldChain,
    transport: http(config.worldchain.rpcUrl),
    account,
  });
};
