import { createPublicClient, defineChain, http } from 'viem';

const DEFAULT_RPC = 'https://worldchain-mainnet.g.alchemy.com/public';

const rpcUrl = process.env.NEXT_PUBLIC_RPC ?? DEFAULT_RPC;
const chainId = Number(process.env.NEXT_PUBLIC_WORLDCHAIN_CHAIN_ID ?? 480);

export const worldChain = defineChain({
  id: chainId,
  name: 'World Chain',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
});

export const publicClient = createPublicClient({
  chain: worldChain,
  transport: http(rpcUrl),
});
