'use client';

import { useTokenomics } from '@/lib/hooks/useTokenomics';
import { formatNumber } from '@/lib/number';

export function BurnWidget() {
  const { burn, isLoading, error } = useTokenomics();

  const isFallback = burn?.isFallback ?? false;

  if (isLoading && !burn) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Burn</h2>
          <span className="text-sm text-white/60">Cargando…</span>
        </header>
        <p className="text-sm text-white/70">Consultando métricas de quema…</p>
      </section>
    );
  }

  if (!burn) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Burn</h2>
          <span className="text-sm text-white/60">Sin datos</span>
        </header>
        <p className="text-sm text-red-300">
          No fue posible calcular las métricas de burn.
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
        <h2 className="text-lg font-semibold text-white">Burn</h2>
        <span className="text-sm text-white/60">{isFallback ? 'Mock' : 'Dinámico'}</span>
      </header>
      <dl className="space-y-3 text-white">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Tasa actual</dt>
          <dd className="text-xl font-semibold">
            {formatNumber(burn.burnRate)}%
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Quemado pendiente</dt>
          <dd className="text-lg font-medium">
            {formatNumber(burn.pending)} WFANS
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Última epoch quemada</dt>
          <dd className="text-lg font-medium">#{burn.lastEpoch}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Dirección de treasury</dt>
          <dd className="text-xs font-mono text-white/80">
            {burn.treasuryAddress}
          </dd>
        </div>
      </dl>
      {(error || isFallback) && (
        <p className="mt-4 text-xs text-white/60">
          {error
            ? `Información parcial: ${error.message}`
            : 'Mostrando datos temporales mientras el RPC responde.'}
        </p>
      )}
    </section>
  );
}
