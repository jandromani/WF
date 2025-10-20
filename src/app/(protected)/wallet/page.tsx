'use client';

import { ActivityList } from '@/components/wallet/ActivityList';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { BuyWFANSButton } from '@/components/wallet/BuyWFANSButton';
import { useWallet } from '@/lib/hooks/useWallet';

export default function WalletPage() {
  const { balance, activity, isLoading } = useWallet();

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Wallet</h1>
        <p className="text-sm text-gray-500">
          Gestiona tu saldo WFANS y revisa tus transacciones.
        </p>
      </header>
      <BalanceCard balance={balance} isLoading={isLoading} />
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">Comprar WFANS</h2>
        <p className="mt-1 text-sm text-gray-500">
          Abre World App para completar la compra.
        </p>
        <BuyWFANSButton />
      </div>
      <ActivityList items={activity} isLoading={isLoading} />
    </div>
  );
}
