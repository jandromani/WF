'use client';

import useSWR from 'swr';

import { Creator, getCreator, listCreators, subscribe } from '@/services/creators';

interface CreatorsHook {
  creators?: Creator[];
  isLoading: boolean;
  error?: Error;
  subscribeToCreator: (id: string) => Promise<{ success: boolean }>;
  refresh: () => Promise<void>;
}

interface CreatorHook {
  creator?: Creator | null;
  isLoading: boolean;
  error?: Error;
  subscribe: () => Promise<{ success: boolean }>;
  refresh: () => Promise<void>;
}

const creatorsKey = ['creators'];

export function useCreators(): CreatorsHook {
  const { data, error, isLoading, mutate } = useSWR<Creator[], Error>(
    creatorsKey,
    listCreators,
  );

  const subscribeToCreator = async (id: string) => {
    const result = await subscribe(id);
    await mutate();
    return { success: result };
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
  const { data, error, isLoading, mutate } = useSWR<Creator | null, Error>(
    ['creator', id],
    () => getCreator(id),
    { shouldRetryOnError: false },
  );

  const subscribeHandler = async () => {
    const result = await subscribe(id);
    await mutate();
    return { success: result };
  };

  return {
    creator: data,
    isLoading,
    error: error ?? undefined,
    subscribe: subscribeHandler,
    refresh: async () => {
      await mutate();
    },
  };
}
