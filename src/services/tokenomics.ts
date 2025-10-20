export interface SupplyStats {
  circulating: number;
  total: number;
  burned: number;
}

export interface EpochStats {
  id: number;
  progress: number;
  endsAt: string;
}

export interface BurnStats {
  rate: number;
  lastEpochBurn: number;
}

const TOKENOMICS_ENDPOINT = '/api/tokenomics';

async function withFallback<T>(request: () => Promise<T>, fallback: T) {
  try {
    return await request();
  } catch (error) {
    console.warn('Falling back to tokenomics placeholder data', error);
    return fallback;
  }
}

export async function getSupply(): Promise<SupplyStats> {
  return withFallback(
    async () => {
      const response = await fetch(`${TOKENOMICS_ENDPOINT}/supply`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to load supply');
      }
      return (await response.json()) as SupplyStats;
    },
    { circulating: 1_250_000, total: 5_000_000, burned: 125_000 },
  );
}

export async function getEpoch(): Promise<EpochStats> {
  return withFallback(
    async () => {
      const response = await fetch(`${TOKENOMICS_ENDPOINT}/epoch`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to load epoch');
      }
      return (await response.json()) as EpochStats;
    },
    {
      id: 12,
      progress: 0.65,
      endsAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    },
  );
}

export async function getBurnStats(): Promise<BurnStats> {
  return withFallback(
    async () => {
      const response = await fetch(`${TOKENOMICS_ENDPOINT}/burn`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to load burn stats');
      }
      return (await response.json()) as BurnStats;
    },
    { rate: 0.025, lastEpochBurn: 12_500 },
  );
}
