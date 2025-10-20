'use client';

import { walletService } from '@/services/wallet';
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';

interface WalletProviderProps {
  children: ReactNode;
}

const WalletContext = createContext(
  undefined as
    | (ReturnType<typeof walletService.getSnapshot> & {
        recordActivity: typeof walletService.recordActivity;
        adjustBalance: typeof walletService.adjustBalance;
      })
    | undefined,
);

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const snapshot = useSyncExternalStore(
    walletService.subscribe,
    walletService.getSnapshot,
    walletService.getSnapshot,
  );

  const value = useMemo(
    () => ({
      ...snapshot,
      recordActivity: walletService.recordActivity,
      adjustBalance: walletService.adjustBalance,
    }),
    [snapshot],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return ctx;
};
