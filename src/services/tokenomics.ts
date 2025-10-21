import { addresses, abis } from '@/lib/worldfans-contracts';
import { getPublicClient } from '@/lib/viem';
import { formatUnits } from 'viem';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;
const TOKENOMICS_WARNING_PREFIX = '[tokenomics] falling back to mock data';

interface TokenomicsBase {
  isFallback: boolean;
  error?: Error;
}

export interface SupplyStats extends TokenomicsBase {
  total: number;
  circulating: number;
  burned: number;
  decimals: number;
  tokenAddress: `0x${string}`;
}

export interface EpochStats extends TokenomicsBase {
  number: number;
  emission: number;
  nextHalvingBlock?: number;
  controllerAddress: `0x${string}`;
}

export interface BurnStats extends TokenomicsBase {
  burnRate: number;
  pending: number;
  lastEpoch: number;
  decimals: number;
  treasuryAddress: `0x${string}`;
}

const client = getPublicClient();

let tokenDecimalsCache: number | undefined;

const isConfigured = (address: `0x${string}`) => address !== ZERO_ADDRESS;

const toDecimal = (value: bigint, decimals: number) =>
  Number.parseFloat(formatUnits(value, decimals));

const withFallback = async <T extends TokenomicsBase>(
  fetcher: () => Promise<T>,
  fallback: () => T,
): Promise<T> => {
  try {
    return await fetcher();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn(TOKENOMICS_WARNING_PREFIX, error);
    const fallbackValue = fallback();
    return { ...fallbackValue, error };
  }
};

const getTokenDecimals = async (): Promise<number> => {
  if (tokenDecimalsCache !== undefined) {
    return tokenDecimalsCache;
  }

  if (!isConfigured(addresses.token)) {
    throw new Error('Token address is not configured');
  }

  const decimals = (await client.readContract({
    address: addresses.token,
    abi: abis.token,
    functionName: 'decimals',
  })) as number;

  tokenDecimalsCache = Number(decimals);
  return tokenDecimalsCache;
};

const fallbackSupply = (): SupplyStats => ({
  total: 21_000_000,
  circulating: 12_345_678.9,
  burned: 2_450_000,
  decimals: 18,
  tokenAddress: addresses.token,
  isFallback: true,
});

const fallbackEpoch = (): EpochStats => ({
  number: 42,
  emission: 50_000,
  nextHalvingBlock: undefined,
  controllerAddress: addresses.data,
  isFallback: true,
});

const fallbackBurn = (): BurnStats => ({
  burnRate: 6.2,
  pending: 125_000,
  lastEpoch: 41,
  decimals: 18,
  treasuryAddress: addresses.treasury,
  isFallback: true,
});

const fetchSupply = async (): Promise<SupplyStats> => {
  const decimals = await getTokenDecimals();

  const totalSupplyPromise = client.readContract({
    address: addresses.token,
    abi: abis.token,
    functionName: 'totalSupply',
  }) as Promise<bigint>;

  const circulatingPromise = isConfigured(addresses.data)
    ? (client.readContract({
        address: addresses.data,
        abi: abis.data,
        functionName: 'circulatingSupply',
      }) as Promise<bigint>)
    : totalSupplyPromise;

  const pendingBurnPromise = isConfigured(addresses.treasury)
    ? (client.readContract({
        address: addresses.treasury,
        abi: abis.treasury,
        functionName: 'pendingBurn',
      }) as Promise<bigint>)
    : Promise.resolve(0n);

  const [totalSupply, circulatingSupplyRaw, pendingBurnRaw] = await Promise.all([
    totalSupplyPromise,
    circulatingPromise,
    pendingBurnPromise,
  ]);

  return {
    total: toDecimal(totalSupply, decimals),
    circulating: toDecimal(circulatingSupplyRaw, decimals),
    burned: toDecimal(pendingBurnRaw, decimals),
    decimals,
    tokenAddress: addresses.token,
    isFallback: false,
  };
};

const fetchEpoch = async (): Promise<EpochStats> => {
  if (!isConfigured(addresses.data)) {
    throw new Error('Data contract address is not configured');
  }

  const decimals = await getTokenDecimals();

  const [epochData, nextHalvingBlockRaw] = await Promise.all([
    client.readContract({
      address: addresses.data,
      abi: abis.data,
      functionName: 'currentEpoch',
    }) as Promise<[bigint, bigint]>,
    client.readContract({
      address: addresses.data,
      abi: abis.data,
      functionName: 'nextHalvingBlock',
    }) as Promise<bigint>,
  ]);

  const [epochNumber, emissionRaw] = epochData;

  return {
    number: Number(epochNumber),
    emission: toDecimal(emissionRaw, decimals),
    nextHalvingBlock: Number(nextHalvingBlockRaw) || undefined,
    controllerAddress: addresses.data,
    isFallback: false,
  };
};

const fetchBurn = async (): Promise<BurnStats> => {
  if (!isConfigured(addresses.treasury)) {
    throw new Error('Treasury contract address is not configured');
  }

  const decimals = await getTokenDecimals();

  const [burnRateRaw, pendingBurnRaw, lastBurnEpochRaw] = await Promise.all([
    client.readContract({
      address: addresses.treasury,
      abi: abis.treasury,
      functionName: 'burnRate',
    }) as Promise<bigint>,
    client.readContract({
      address: addresses.treasury,
      abi: abis.treasury,
      functionName: 'pendingBurn',
    }) as Promise<bigint>,
    client.readContract({
      address: addresses.treasury,
      abi: abis.treasury,
      functionName: 'lastBurnEpoch',
    }) as Promise<bigint>,
  ]);

  const burnRatePercent =
    Number.parseFloat(formatUnits(burnRateRaw, 4)) * 100;

  return {
    burnRate: burnRatePercent,
    pending: toDecimal(pendingBurnRaw, decimals),
    lastEpoch: Number(lastBurnEpochRaw),
    decimals,
    treasuryAddress: addresses.treasury,
    isFallback: false,
  };
};

export const getSupply = () => withFallback(fetchSupply, fallbackSupply);

export const getEpoch = () => withFallback(fetchEpoch, fallbackEpoch);

export const getBurnStats = () => withFallback(fetchBurn, fallbackBurn);

export const getTokenomics = async () => {
  const [supply, epoch, burn] = await Promise.all([
    getSupply(),
    getEpoch(),
    getBurnStats(),
  ]);

  return { supply, epoch, burn };
};
