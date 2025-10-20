'use client';

import useSWR from 'swr';

import {
  BurnStats,
  EpochStats,
  SupplyStats,
  getBurnStats,
  getEpoch,
  getSupply,
} from '@/services/tokenomics';

interface TokenomicsHook {
  supply?: SupplyStats;
  epoch?: EpochStats;
  burn?: BurnStats;
  isLoading: boolean;
  error?: Error;
  refresh: () => Promise<void>;
}

export function useTokenomics(): TokenomicsHook {
  const supplySWR = useSWR<SupplyStats, Error>(['tokenomics', 'supply'], getSupply);
  const epochSWR = useSWR<EpochStats, Error>(['tokenomics', 'epoch'], getEpoch);
  const burnSWR = useSWR<BurnStats, Error>(['tokenomics', 'burn'], getBurnStats);

  const isLoading = supplySWR.isLoading || epochSWR.isLoading || burnSWR.isLoading;
  const error = supplySWR.error ?? epochSWR.error ?? burnSWR.error ?? undefined;

  const refresh = async () => {
    await Promise.all([supplySWR.mutate(), epochSWR.mutate(), burnSWR.mutate()]);
  };

  return {
    supply: supplySWR.data,
    epoch: epochSWR.data,
    burn: burnSWR.data,
    isLoading,
    error,
    refresh,
  };
}
