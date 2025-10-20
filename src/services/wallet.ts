export interface WalletBalance {
  symbol: string;
  amount: number;
  fiatValue?: number;
}

export interface WalletActivityItem {
  id: string;
  type: 'claim' | 'tip' | 'subscribe' | 'buy';
  description: string;
  amount: number;
  timestamp: string;
}

const WALLET_ENDPOINT = '/api/wallet';

async function withFallback<T>(request: () => Promise<T>, fallback: T) {
  try {
    return await request();
  } catch (error) {
    console.warn('Falling back to wallet placeholder data', error);
    return fallback;
  }
}

export async function getBalance(): Promise<WalletBalance> {
  return withFallback(
    async () => {
      const response = await fetch(`${WALLET_ENDPOINT}/balance`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet balance');
      }

      return (await response.json()) as WalletBalance;
    },
    { symbol: 'WFANS', amount: 125.4, fiatValue: 24.8 },
  );
}

export async function getActivity(): Promise<WalletActivityItem[]> {
  return withFallback(
    async () => {
      const response = await fetch(`${WALLET_ENDPOINT}/activity`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet activity');
      }

      return (await response.json()) as WalletActivityItem[];
    },
    [
      {
        id: 'activity-1',
        type: 'claim',
        description: 'Daily claim',
        amount: 5,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'activity-2',
        type: 'tip',
        description: 'Tip to World Builder',
        amount: -2,
        timestamp: new Date(Date.now() - 7200 * 1000).toISOString(),
      },
    ],
  );
}

export async function claimDaily(): Promise<{ success: boolean; amount: number }> {
  return withFallback(
    async () => {
      const response = await fetch(`${WALLET_ENDPOINT}/claim`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to claim daily rewards');
      }

      return (await response.json()) as { success: boolean; amount: number };
    },
    { success: true, amount: 5 },
  );
}

export async function buyWFANS(): Promise<{ success: boolean }> {
  return withFallback(
    async () => {
      const response = await fetch(`${WALLET_ENDPOINT}/buy`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start purchase');
      }

      return (await response.json()) as { success: boolean };
    },
    { success: true },
  );
}
