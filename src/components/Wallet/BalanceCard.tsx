'use client';

import { useWallet } from '@/providers/WalletProvider';

export const BalanceCard = () => {
  const { balance } = useWallet();
  const approxUsd = balance.wldy * balance.usdRate;

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 p-5 text-white shadow-lg">
      <p className="text-sm uppercase tracking-wide text-white/80">Balance</p>
      <p className="mt-2 text-4xl font-semibold">
        {balance.wldy.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{' '}
        WLDY
      </p>
      <p className="mt-1 text-sm text-white/70">
        ≈ $
        {approxUsd.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{' '}
        USD
      </p>
    </div>
  );
};
