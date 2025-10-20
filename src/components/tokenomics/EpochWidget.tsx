import { formatNumber } from '@/lib/number';

async function fetchEpochStats() {
  // Placeholder hasta que se conecte al subgraph / contrato real.
  return {
    currentEpoch: 42,
    epochEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    activityScore: 87.5,
  };
}

export async function EpochWidget() {
  const { currentEpoch, epochEndsAt, activityScore } = await fetchEpochStats();

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Epoch</h2>
        <span className="text-sm text-white/60">#{currentEpoch}</span>
      </header>
      <dl className="space-y-3 text-white">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Termina</dt>
          <dd className="text-lg font-medium">
            {epochEndsAt.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Activity Score</dt>
          <dd className="text-xl font-semibold">{formatNumber(activityScore)}%</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-white/70">Contrato controlador</dt>
          <dd className="text-xs font-mono text-white/80">
            {process.env.NEXT_PUBLIC_EPOCH_CONTROLLER ?? 'Define NEXT_PUBLIC_EPOCH_CONTROLLER'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
