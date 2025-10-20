'use client';

import { useTokenomics } from '@/lib/hooks/useTokenomics';
import { formatNumber } from '@/lib/number';

export function EpochWidget() {
  const { epoch, isLoading, error } = useTokenomics();

  const isFallback = epoch?.isFallback ?? false;

  if (isLoading && !epoch) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Epoch</h2>
          <span className="text-sm text-white/60">Cargando…</span>
        </header>
        <p className="text-sm text-white/70">Sincronizando datos del contrato…</p>
      </section>
    );
  }

  if (!epoch) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Epoch</h2>
          <span className="text-sm text-white/60">Sin datos</span>
        </header>
        <p className="text-sm text-red-300">
          No fue posible recuperar la información de la epoch.
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
        <h2 className="text-lg font-semibold text-white">Epoch</h2>
        <span className="text-sm text-white/60">#{epoch.number}</span>
      </header>
      <dl className="space-y-3 text-white">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Emisión por bloque</dt>
          <dd className="text-lg font-medium">
            {formatNumber(epoch.emission)} WFANS
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Próximo halving</dt>
          <dd className="text-lg font-medium">
            {epoch.nextHalvingBlock
              ? `Bloque ${epoch.nextHalvingBlock.toLocaleString()}`
              : 'Pendiente de anunciar'}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Contrato controlador</dt>
          <dd className="text-xs font-mono text-white/80">{epoch.controllerAddress}</dd>
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
