'use client';

import useSWR from 'swr';

import {
  WalletActivityItem,
  WalletBalance,
  buyWFANS,
  claimDaily,
  getActivity,
  getBalance,
} from '@/services/wallet';

interface WalletHook {
  balance?: WalletBalance;
  activity?: WalletActivityItem[];
  isLoading: boolean;
  error?: Error;
  refresh: () => Promise<void>;
  claim: () => Promise<{ success: boolean; amount: number }>;
  buy: () => Promise<{ success: boolean }>;
}

const balanceKey = ['wallet', 'balance'];
const activityKey = ['wallet', 'activity'];

export function useWallet(): WalletHook {
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    mutate: mutateBalance,
  } = useSWR<WalletBalance, Error>(balanceKey, getBalance);

  const {
    data: activity,
    isLoading: activityLoading,
    error: activityError,
    mutate: mutateActivity,
  } = useSWR<WalletActivityItem[], Error>(activityKey, getActivity);

  const isLoading = balanceLoading || activityLoading;
  const error = balanceError ?? activityError ?? undefined;

  const refresh = async () => {
    await Promise.all([mutateBalance(), mutateActivity()]);
  };

  const claimHandler = async () => {
    const result = await claimDaily();
    await refresh();
    return result;
  };

  const buyHandler = async () => {
    const result = await buyWFANS();
    await refresh();
    return result;
  };

  return {
    balance,
    activity,
    isLoading,
    error,
    refresh,
    claim: claimHandler,
    buy: buyHandler,
  };
}
