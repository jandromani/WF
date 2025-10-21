export type SupplyStats = { circulating: number; treasury: number; staked: number };
export type EpochStats = { epoch: number; rewards: number };
export type BurnStats = { totalBurned: number; lastBurn: number };

export async function getSupply(): Promise<SupplyStats> {
  return { circulating: 250000, treasury: 50000, staked: 125000 };
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

export async function getBurnStats(): Promise<BurnStats> {
  return { totalBurned: 1200, lastBurn: 25 };
}
