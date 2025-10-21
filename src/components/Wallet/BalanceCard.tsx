import { WalletBalance } from '@/services/wallet';

interface BalanceCardProps {
  balance?: WalletBalance;
  isLoading?: boolean;
}

export function BalanceCard({ balance, isLoading }: BalanceCardProps) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white shadow-lg">
      <p className="text-sm uppercase tracking-widest text-white/70">Saldo disponible</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold">
            {isLoading ? '—' : balance ? balance.amount.toFixed(2) : '0.00'}{' '}
            <span className="text-base font-medium text-white/80">
              {balance?.symbol ?? 'WFANS'}
            </span>
          </p>
          {balance?.fiatValue !== undefined ? (
            <p className="text-sm text-white/70">
              ≈ ${balance.fiatValue.toFixed(2)} USD
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
