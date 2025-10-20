'use client';

import useSWR from 'swr';

import {
  CreatorProfile,
  CreatorSummary,
  getCreator,
  listCreators,
  subscribe,
  tip,
} from '@/services/creators';

interface CreatorsHook {
  creators?: CreatorSummary[];
  isLoading: boolean;
  error?: Error;
  subscribeToCreator: (id: string, price: number) => Promise<{ success: boolean }>;
  refresh: () => Promise<void>;
}

interface CreatorHook {
  creator?: CreatorProfile | null;
  isLoading: boolean;
  error?: Error;
  subscribe: (price: number) => Promise<{ success: boolean }>;
  tip: (amount: number) => Promise<{ success: boolean }>;
  refresh: () => Promise<void>;
}

const creatorsKey = ['creators'];

export function useCreators(): CreatorsHook {
  const { data, error, isLoading, mutate } = useSWR<CreatorSummary[], Error>(
    creatorsKey,
    listCreators,
  );

  const subscribeToCreator = async (id: string, price: number) => {
    const result = await subscribe(id, price);
    await mutate();
    return result;
  };

  return {
    creators: data,
    isLoading,
    error: error ?? undefined,
    subscribeToCreator,
    refresh: async () => {
      await mutate();
    },
  };
}

export function useCreator(id: string): CreatorHook {
  const { data, error, isLoading, mutate } = useSWR<CreatorProfile | null, Error>(
    ['creator', id],
    () => getCreator(id),
    { shouldRetryOnError: false },
  );

  const subscribeHandler = async (price: number) => {
    const result = await subscribe(id, price);
    await mutate();
    return result;
  };

  const tipHandler = async (amount: number) => {
    const result = await tip(id, amount);
    await mutate();
    return result;
  };

  return {
    creator: data,
    isLoading,
    error: error ?? undefined,
    subscribe: subscribeHandler,
    tip: tipHandler,
    refresh: async () => {
      await mutate();
    },
  };
}
