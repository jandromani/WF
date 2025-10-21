'use client';

import { useTokenomics } from '@/lib/hooks/useTokenomics';
import { formatNumber } from '@/lib/number';

export function SupplyWidget() {
  const { supply, isLoading, error } = useTokenomics();

  const isFallback = supply?.isFallback ?? false;

  if (isLoading && !supply) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Supply</h2>
          <span className="text-sm text-white/60">Cargando…</span>
        </header>
        <p className="text-sm text-white/70">Obteniendo métricas on-chain…</p>
      </section>
    );
  }

  if (!supply) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Supply</h2>
          <span className="text-sm text-white/60">Sin datos</span>
        </header>
        <p className="text-sm text-red-300">
          No fue posible obtener las estadísticas de supply en este momento.
        </p>
        {error && (
          <p className="mt-2 text-xs text-white/60">Detalles: {error.message}</p>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Supply</h2>
        <span className="text-sm text-white/60">
          {isFallback ? 'Mock' : 'En vivo'}
        </span>
      </header>
      <dl className="space-y-3 text-white">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Circulante</dt>
          <dd className="text-xl font-semibold">
            {formatNumber(supply.circulating)} WFANS
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Máximo programado</dt>
          <dd className="text-lg font-medium">
            {formatNumber(supply.total)} WFANS
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Dirección del token</dt>
          <dd className="text-xs font-mono text-white/80">
            {supply.tokenAddress}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Total quemado</dt>
          <dd className="text-lg font-medium">
            {formatNumber(supply.burned)} WFANS
          </dd>
        </div>
      </dl>
      {(error || isFallback) && (
        <p className="mt-4 text-xs text-white/60">
          {error
            ? `Se muestra información parcial: ${error.message}`
            : 'Mostrando datos temporales mientras el RPC responde.'}
        </p>
      )}
    </section>
  );
}
