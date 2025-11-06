'use client';

import useSWR from 'swr';

import { useWorldChainWalletContext } from '@/providers/WorldChainWalletProvider';
import {
  Activity,
  buyWFANS,
  claimDaily,
  getActivity,
  recordActivity,
} from '@/services/wallet';

interface WalletHook {
  address?: `0x${string}`;
  balance: number;
  activity?: Activity[];
  isLoading: boolean;
  status: string;
  error?: Error;
  refresh: () => Promise<void>;
  claim: () => Promise<{ success: boolean; amount: number }>;
  buy: (amount: number) => Promise<{ success: boolean }>;
  addActivity: (activity: Omit<Activity, 'id' | 'ts'>) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const activityKey = ['wallet', 'activity'];

export function useWallet(): WalletHook {
  const wallet = useWorldChainWalletContext();
  const { data: activity, isLoading: activityLoading, mutate: mutateActivity } =
    useSWR<Activity[]>(activityKey, getActivity);

  const isLoading = activityLoading || wallet.loadingBalance;

  const refresh = async () => {
    await Promise.all([wallet.refreshBalance(), mutateActivity()]);
  };

  const claimHandler = async () => {
    const result = await claimDaily();
    await wallet.refreshBalance();
    await mutateActivity();
    return { success: result.ok, amount: result.amount };
  };

  const buyHandler = async (amount: number) => {
    const result = await buyWFANS(amount);
    await mutateActivity();
    return { success: result.ok };
  };

  const addActivity = async (input: Omit<Activity, 'id' | 'ts'>) => {
    await recordActivity({ ...input, id: '', ts: Date.now() } as Activity);
    await mutateActivity();
  };

  return {
    address: wallet.address,
    balance: wallet.balance,
    activity,
    isLoading,
    status: wallet.status,
    error: wallet.error ? new Error(wallet.error) : undefined,
    refresh,
    claim: claimHandler,
    buy: buyHandler,
    addActivity,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
  };
}
