import { formatNumber } from '@/lib/number';

async function fetchMockedSupply() {
  // TODO: Replace with viem call once mainnet addresses estén disponibles.
  const circulating = 12_345_678.9;
  const maxSupply = 21_000_000;
  return { circulating, maxSupply };
}

export async function SupplyWidget() {
  const { circulating, maxSupply } = await fetchMockedSupply();

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Supply</h2>
        <span className="text-sm text-white/60">En vivo</span>
      </header>
      <dl className="space-y-3 text-white">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Circulante</dt>
          <dd className="text-xl font-semibold">{formatNumber(circulating)} WFANS</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Máximo programado</dt>
          <dd className="text-lg font-medium">{formatNumber(maxSupply)} WFANS</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Dirección del token</dt>
          <dd className="text-xs font-mono text-white/80">
            {process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? 'Configura NEXT_PUBLIC_TOKEN_ADDRESS'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
