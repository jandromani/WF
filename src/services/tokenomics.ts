import { addresses, abis } from '@/lib/worldfans-contracts';
import { createPublicClient, formatUnits, http } from 'viem';
import { worldchainSepolia } from 'viem/chains';

const rpcUrl =
  process.env.NEXT_PUBLIC_WORLDCHAIN_RPC ??
  worldchainSepolia.rpcUrls.default.http[0];

const publicClient = createPublicClient({
  chain: worldchainSepolia,
  transport: http(rpcUrl),
});

const formatNumber = (value: bigint, decimals: number) =>
  Number.parseFloat(formatUnits(value, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export interface TokenomicsData {
  supply: {
    total: string;
    circulating: string;
    burned: string;
  };
  epoch: {
    number: number;
    emission: string;
    nextHalvingBlock?: number;
  };
  burn: {
    rate: string;
    pending: string;
    lastEpoch: number;
  };
  emissionsSchedule: Array<{ epoch: string; emission: string }>;
  dynamicBurns: Array<{ trigger: string; burnRate: string }>;
}

async function readContractSafe<T>(fn: () => Promise<T>, fallback: T) {
  try {
    return await fn();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[tokenomics] fallback read', error);
    }
    return fallback;
  }
}

export async function getTokenomics(): Promise<TokenomicsData> {
  const decimals = await readContractSafe(
    () =>
      publicClient.readContract({
        address: addresses.token as `0x${string}`,
        abi: abis.token,
        functionName: 'decimals',
      }) as Promise<number>,
    18,
  );

  const totalSupply = await readContractSafe(
    () =>
      publicClient.readContract({
        address: addresses.token as `0x${string}`,
        abi: abis.token,
        functionName: 'totalSupply',
      }) as Promise<bigint>,
    0n,
  );

  const circulatingSupply =
    addresses.data && abis.data
      ? await readContractSafe(
          () =>
            publicClient.readContract({
              address: addresses.data as `0x${string}`,
              abi: abis.data,
              functionName: 'circulatingSupply',
            }) as Promise<bigint>,
          totalSupply,
        )
      : totalSupply;

  const burnRate = await readContractSafe(
    () =>
      publicClient.readContract({
        address: addresses.treasury as `0x${string}`,
        abi: abis.treasury,
        functionName: 'burnRate',
      }) as Promise<bigint>,
    0n,
  );

  const pendingBurn = await readContractSafe(
    () =>
      publicClient.readContract({
        address: addresses.treasury as `0x${string}`,
        abi: abis.treasury,
        functionName: 'pendingBurn',
      }) as Promise<bigint>,
    0n,
  );

  const lastBurnEpoch = await readContractSafe(
    () =>
      publicClient.readContract({
        address: addresses.treasury as `0x${string}`,
        abi: abis.treasury,
        functionName: 'lastBurnEpoch',
      }) as Promise<bigint>,
    0n,
  );

  const epochData =
    addresses.data && abis.data
      ? await readContractSafe(
          () =>
            publicClient.readContract({
              address: addresses.data as `0x${string}`,
              abi: abis.data,
              functionName: 'currentEpoch',
            }) as Promise<[bigint, bigint]>,
          [0n, 0n],
        )
      : [0n, 0n];

  const nextHalving =
    addresses.data && abis.data
      ? await readContractSafe(
          () =>
            publicClient.readContract({
              address: addresses.data as `0x${string}`,
              abi: abis.data,
              functionName: 'nextHalvingBlock',
            }) as Promise<bigint>,
          0n,
        )
      : 0n;

  const [epochNumber, emissionRate] = epochData;

  const burnRatePercent = Number.parseFloat(formatUnits(burnRate, 4)) * 100;

  return {
    supply: {
      total: formatNumber(totalSupply, decimals),
      circulating: formatNumber(circulatingSupply, decimals),
      burned: formatNumber(pendingBurn, decimals),
    },
    epoch: {
      number: Number(epochNumber),
      emission: formatNumber(emissionRate, decimals),
      nextHalvingBlock: Number(nextHalving) || undefined,
    },
    burn: {
      rate: `${burnRatePercent.toFixed(2)}%`,
      pending: formatNumber(pendingBurn, decimals),
      lastEpoch: Number(lastBurnEpoch),
    },
    emissionsSchedule: [
      { epoch: 'Epoch 0', emission: '50,000 WLDY / day' },
      { epoch: 'Epoch 1', emission: '40,000 WLDY / day' },
      { epoch: 'Epoch 2', emission: '32,000 WLDY / day' },
      { epoch: 'Epoch 3', emission: '25,600 WLDY / day' },
    ],
    dynamicBurns: [
      { trigger: 'Subscription surge', burnRate: '5% auto-burn' },
      { trigger: 'Creator milestone', burnRate: '8% weekly burn' },
      { trigger: 'Premium unlock streak', burnRate: '12% bonus burn' },
    ],
  };
}
