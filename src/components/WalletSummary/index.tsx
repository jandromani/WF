'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';

import { useWalletStore } from '@/store/useWalletStore';

const formatAmount = (amount: number) => `${amount >= 0 ? '+' : ''}${amount.toFixed(2)} WLD`;

export const WalletSummary = () => {
  const balance = useWalletStore((state) => state.balance);
  const activity = useWalletStore((state) => state.activity);
  const refresh = useWalletStore((state) => state.refresh);

  return (
    <div
      className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid="wallet-summary"
    >
      <div className="mb-3 flex flex-row items-start justify-between">
        <div>
          <p className="text-base font-semibold">Wallet</p>
          <p className="text-sm text-slate-500">
            Controla tus fondos y actividad reciente.
          </p>
        </div>
        <Button size="sm" variant="tertiary" onClick={refresh} data-testid="wallet-refresh">
          Actualizar
        </Button>
      </div>
      <div className="grid gap-4">
        <div>
          <p className="text-xs text-slate-500">Balance</p>
          <p className="text-3xl font-semibold" data-testid="wallet-balance">
            {balance.toFixed(2)} WLD
          </p>
        </div>
        <div className="grid gap-2" data-testid="wallet-activity">
          {activity.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border border-slate-200 p-2"
              data-testid="wallet-activity-item"
            >
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className="text-sm font-semibold">{formatAmount(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
