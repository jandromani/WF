'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { hexToBigInt, parseUnits } from 'viem';

import WorldFansToken from '@/abi/WorldFansToken.json';
import { env } from '@/lib/env';
import {
  publicClient,
  getWalletClient,
  worldChain,
  type Eip1193Provider,
} from '@/lib/worldchain/client';
import type { Abi } from 'viem';

const TOKEN_DECIMALS = 18n;
const ZERO = 0n;

type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

type AllowanceCache = Record<string, bigint>;

export interface UseWorldChainWallet { 
  address?: `0x${string}`;
  status: WalletStatus;
  balance: number;
  loadingBalance: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  ensureAllowance: (spender: `0x${string}`, amount: bigint) => Promise<void>;
  getAllowance: (spender: `0x${string}`) => Promise<bigint>;
  error?: string;
}

const toNumberBalance = (amount: bigint) => {
  const formatted = Number(amount) / Number(10n ** TOKEN_DECIMALS);
  return Number(formatted.toFixed(6));
};

export const useWorldChainWallet = (): UseWorldChainWallet => {
  const [address, setAddress] = useState<`0x${string}`>();
  const [status, setStatus] = useState<WalletStatus>('disconnected');
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [error, setError] = useState<string>();
  const allowanceCache = useMemo<AllowanceCache>(() => ({}), []);

  const fetchBalance = useCallback(async (owner: `0x${string}`) => {
    if (!env.contracts.token) {
      throw new Error('Dirección del token no configurada');
    }
    setLoadingBalance(true);
    try {
      const raw = (await publicClient.readContract({
        address: env.contracts.token,
        abi: (WorldFansToken as { abi: Abi }).abi,
        functionName: 'balanceOf',
        args: [owner],
      })) as bigint;
      setBalance(toNumberBalance(raw));
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const handleAccountsChanged = useCallback(
    (accounts: string[]) => {
      if (accounts.length) {
        setAddress(accounts[0] as `0x${string}`);
        void fetchBalance(accounts[0] as `0x${string}`);
      } else {
        setAddress(undefined);
        setBalance(0);
        setStatus('disconnected');
      }
    },
    [fetchBalance],
  );

  const connect = useCallback(async () => {
    setStatus('connecting');
    setError(undefined);
    try {
      const wallet = await getWalletClient();
      await wallet.switchChain({ id: worldChain.id });
      const accounts = await wallet.requestAddresses();
      if (!accounts.length) {
        throw new Error('No se autorizó ninguna cuenta');
      }
      const owner = accounts[0];
      setAddress(owner);
      setStatus('connected');
      await fetchBalance(owner);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al conectar wallet';
      setError(message);
      setStatus('error');
    }
  }, [fetchBalance]);

  const disconnect = useCallback(async () => {
    setAddress(undefined);
    setBalance(0);
    setStatus('disconnected');
    setError(undefined);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const ethereum = (window as typeof window & { ethereum?: Eip1193Provider }).ethereum;
    if (!ethereum) {
      return;
    }
    const accountsChanged = (accounts: string[]) => handleAccountsChanged(accounts);
    ethereum.on?.('accountsChanged', accountsChanged);
    return () => {
      ethereum.removeListener?.('accountsChanged', accountsChanged);
    };
  }, [handleAccountsChanged]);

  const refreshBalance = useCallback(async () => {
    if (!address) {
      return;
    }
    await fetchBalance(address);
  }, [address, fetchBalance]);

  const getAllowance = useCallback(
    async (spender: `0x${string}`) => {
      if (!address) {
        return ZERO;
      }
      const cacheKey = `${address}-${spender}`;
      if (allowanceCache[cacheKey] !== undefined) {
        return allowanceCache[cacheKey];
      }
      const value = (await publicClient.readContract({
        address: env.contracts.token!,
        abi: (WorldFansToken as { abi: Abi }).abi,
        functionName: 'allowance',
        args: [address, spender],
      })) as bigint;
      allowanceCache[cacheKey] = value;
      return value;
    },
    [address, allowanceCache],
  );

  const ensureAllowance = useCallback(
    async (spender: `0x${string}`, amount: bigint) => {
      if (!address) {
        throw new Error('Conecta tu wallet para continuar');
      }
      if (!env.contracts.token) {
        throw new Error('Dirección del token no configurada');
      }
      const wallet = await getWalletClient();
      await wallet.switchChain({ id: worldChain.id });
      const current = await getAllowance(spender);
      if (current >= amount) {
        return;
      }
      const hash = await wallet.writeContract({
        address: env.contracts.token,
        abi: (WorldFansToken as { abi: Abi }).abi,
        functionName: 'approve',
        args: [spender, amount],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      const cacheKey = `${address}-${spender}`;
      allowanceCache[cacheKey] = amount;
    },
    [address, allowanceCache, getAllowance],
  );

  return {
    address,
    status,
    balance,
    loadingBalance,
    connect,
    disconnect,
    refreshBalance,
    ensureAllowance,
    getAllowance,
    error,
  };
};

export const toTokenUnits = (value: number) => {
  const valueString = value.toString();
  const [whole, fraction = ''] = valueString.split('.');
  const normalized = `${whole}.${fraction.slice(0, 18)}`;
  return parseUnits(normalized, Number(TOKEN_DECIMALS));
};

export const fromHexAmount = (value: string | bigint) => {
  const bigIntValue = typeof value === 'string' ? hexToBigInt(value) : value;
  return Number(bigIntValue) / Number(10n ** TOKEN_DECIMALS);
};
