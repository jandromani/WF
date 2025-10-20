'use client';

import { feed } from '@/services/feed';
import { useSyncExternalStore } from 'react';

export interface Creator {
  id: string;
  displayName: string;
  handle: string;
  subscriptionPrice: number;
  tierDescription: string;
  avatar?: string;
  subscribers: number;
  isSubscribed: boolean;
  tipOptions: number[];
  totalTips: number;
}

interface CreatorsState {
  creators: Creator[];
}

const listeners = new Set<(state: CreatorsState) => void>();

const initialState: CreatorsState = {
  creators: [
    {
      id: 'alex',
      displayName: 'Alex Rivera',
      handle: '@alex',
      subscriptionPrice: 12.5,
      tierDescription: 'Behind-the-scenes drops twice a week',
      avatar: undefined,
      subscribers: 128,
      isSubscribed: false,
      tipOptions: [1, 2.5, 5],
      totalTips: 322,
    },
    {
      id: 'zara',
      displayName: 'Zara Waves',
      handle: '@zarawaves',
      subscriptionPrice: 8,
      tierDescription: 'Exclusive studio sessions every Friday',
      avatar: undefined,
      subscribers: 98,
      isSubscribed: true,
      tipOptions: [0.5, 1, 3],
      totalTips: 210,
    },
  ],
};

let state: CreatorsState = initialState;

const clone = (value: CreatorsState): CreatorsState => ({
  creators: value.creators.map((creator) => ({ ...creator })),
});

const notify = () => {
  const snapshot = clone(state);
  listeners.forEach((listener) => listener(snapshot));
};

const updateCreator = (creatorId: string, updater: (creator: Creator) => void) => {
  state = {
    creators: state.creators.map((creator) => {
      if (creator.id !== creatorId) {
        return creator;
      }
      const copy = { ...creator };
      updater(copy);
      return copy;
    }),
  };
  notify();
};

const listen = (listener: (snapshot: CreatorsState) => void) => {
  listeners.add(listener);
  listener(clone(state));
  return () => listeners.delete(listener);
};

const subscribeCreator = async (creatorId: string) => {
  updateCreator(creatorId, (creator) => {
    if (!creator.isSubscribed) {
      creator.isSubscribed = true;
      creator.subscribers += 1;
    }
  });
  await feed.unlockPostsByCreator(creatorId);
};

const tipCreator = async (creatorId: string, amount: number) => {
  updateCreator(creatorId, (creator) => {
    creator.totalTips += amount;
  });
};

export const creators = {
  listen,
  getSnapshot: () => clone(state),
  async subscribe(creatorId: string, price: number) {
    void price;
    await subscribeCreator(creatorId);
  },
  async tip(creatorId: string, amount: number) {
    await tipCreator(creatorId, amount);
  },
  async getCreator(creatorId: string) {
    return clone(state).creators.find((creator) => creator.id === creatorId);
  },
};

export const useCreatorsStore = () =>
  useSyncExternalStore(creators.listen, creators.getSnapshot, creators.getSnapshot);

export type CreatorsService = typeof creators;
