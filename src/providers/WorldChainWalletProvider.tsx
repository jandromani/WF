'use client';

import { createContext, useContext } from 'react';

import {
  type UseWorldChainWallet,
  useWorldChainWallet,
} from '@/lib/hooks/useWorldChainWallet';

const WalletContext = createContext<UseWorldChainWallet | null>(null);

export const WorldChainWalletProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const wallet = useWorldChainWallet();
  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
};

export const useWorldChainWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWorldChainWalletContext must be used within WorldChainWalletProvider');
  }
  return context;
};
