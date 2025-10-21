'use client';

import useSWR from 'swr';

import { Activity, buyWFANS, claimDaily, getActivity, getBalance, recordActivity } from '@/services/wallet';

interface WalletHook {
  balance?: number;
  activity?: Activity[];
  isLoading: boolean;
  error?: Error;
  refresh: () => Promise<void>;
  claim: () => Promise<{ success: boolean; amount: number }>;
  buy: (amount: number) => Promise<{ success: boolean }>;
  addActivity: (activity: Omit<Activity, 'id' | 'ts'>) => Promise<void>;
}

const balanceKey = ['wallet', 'balance'];
const activityKey = ['wallet', 'activity'];

export function useWallet(): WalletHook {
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    mutate: mutateBalance,
  } = useSWR<number, Error>(balanceKey, getBalance);

  const {
    data: activity,
    isLoading: activityLoading,
    error: activityError,
    mutate: mutateActivity,
  } = useSWR<Activity[], Error>(activityKey, getActivity);

  const isLoading = balanceLoading || activityLoading;
  const error = balanceError ?? activityError ?? undefined;

  const refresh = async () => {
    await Promise.all([mutateBalance(), mutateActivity()]);
  };

  const claimHandler = async () => {
    const result = await claimDaily();
    await mutateBalance(result.newBalance, { revalidate: false });
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
    balance,
    activity,
    isLoading,
    error,
    refresh,
    claim: claimHandler,
    buy: buyHandler,
    addActivity,
  };
}
