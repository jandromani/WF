import { env } from '@/lib/env';
import type { Chain } from 'viem';
import { createPublicClient, createWalletClient, custom, http } from 'viem';

export type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

const WORLDCHAIN_NATIVE_SYMBOL = 'WLD';
const WORLDCHAIN_NATIVE_NAME = 'World Chain Ether';
const WORLDCHAIN_DECIMALS = 18;

export const worldChain: Chain = {
  id: env.worldChain.chainId,
  name: 'World Chain',
  nativeCurrency: {
    name: WORLDCHAIN_NATIVE_NAME,
    symbol: WORLDCHAIN_NATIVE_SYMBOL,
    decimals: WORLDCHAIN_DECIMALS,
  },
  rpcUrls: {
    default: { http: [env.worldChain.rpcUrl] },
    public: { http: [env.worldChain.rpcUrl] },
  },
  testnet: env.worldChain.chainId !== 0,
};

export const publicClient = createPublicClient({
  chain: worldChain,
  transport: http(env.worldChain.rpcUrl),
});

export const getWalletClient = async () => {
  if (typeof window === 'undefined') {
    throw new Error('World Chain wallet provider no disponible');
  }
  const provider = (window as typeof window & { ethereum?: Eip1193Provider }).ethereum;
  if (!provider) {
    throw new Error('World Chain wallet provider no disponible');
  }
  return createWalletClient({
    chain: worldChain,
    transport: custom(provider),
  });
};
