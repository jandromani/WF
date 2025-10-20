import { formatNumber } from '@/lib/number';

async function fetchBurnStats() {
  return {
    burnRate: 6.2,
    last24hBurn: 125_000,
    cumulativeBurn: 2_450_000,
  };
}

export async function BurnWidget() {
  const { burnRate, last24hBurn, cumulativeBurn } = await fetchBurnStats();

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Burn</h2>
        <span className="text-sm text-white/60">Dinámico</span>
      </header>
      <dl className="space-y-3 text-white">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Tasa actual</dt>
          <dd className="text-xl font-semibold">{formatNumber(burnRate)}%</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Quemado últimas 24h</dt>
          <dd className="text-lg font-medium">{formatNumber(last24hBurn)} WFANS</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Total quemado</dt>
          <dd className="text-lg font-medium">{formatNumber(cumulativeBurn)} WFANS</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Dirección de treasury</dt>
          <dd className="text-xs font-mono text-white/80">
            {process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? 'Define NEXT_PUBLIC_TREASURY_ADDRESS'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
