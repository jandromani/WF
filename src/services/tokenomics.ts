export type SupplyStats = { circulating: number; treasury: number; staked: number };
export type EpochStats = { epoch: number; rewards: number };
export type BurnStats = { totalBurned: number; lastBurn: number };

export async function getSupply(): Promise<SupplyStats> {
  return { circulating: 250000, treasury: 50000, staked: 125000 };
}

export async function getBurnStats(): Promise<BurnStats> {
  return { totalBurned: 1200, lastBurn: 25 };
}
