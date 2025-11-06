'use client';

interface BalanceCardProps {
  balance: number;
  isLoading?: boolean;
}

export function BalanceCard({ balance, isLoading }: BalanceCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Balance disponible</p>
          <p className="text-2xl font-semibold text-slate-900">
            {isLoading ? '···' : `${balance.toFixed(3)} WFANS`}
          </p>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          Wallet
        </div>
      </header>
      <p className="mt-3 text-xs text-slate-500">
        Sincronizado en World Chain. Recarga tu balance para enviar tips o suscribirte.
      </p>
    </article>
  );
}
