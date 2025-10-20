'use client';

import { useEffect } from 'react';

import { hydrateAuthStore } from '@/store/useAuthStore';
import { hydrateFeedStore } from '@/store/useFeedStore';
import { hydrateWalletStore } from '@/store/useWalletStore';

export const StoreHydrator = () => {
  useEffect(() => {
    hydrateAuthStore();
    hydrateFeedStore();
    hydrateWalletStore();
  }, []);

  return null;
};
