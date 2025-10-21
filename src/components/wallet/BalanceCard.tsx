interface BalanceCardProps {
  balance?: number;
  isLoading?: boolean;
}

export function BalanceCard({ balance, isLoading }: BalanceCardProps) {
  return (
    <section
      className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white shadow-lg"
      data-testid="wallet-balance"
    >
      <p className="text-sm uppercase tracking-widest text-white/70">Saldo disponible</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold">
            {isLoading ? '—' : (balance ?? 0).toFixed(2)}{' '}
            <span className="text-base font-medium text-white/80">WFANS</span>
          </p>
        </div>
      </div>
    </section>
  );
}
