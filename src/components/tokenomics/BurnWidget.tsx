import { BurnStats } from '@/services/tokenomics';

interface BurnWidgetProps {
  data?: BurnStats;
  isLoading?: boolean;
}

export function BurnWidget({ data, isLoading }: BurnWidgetProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="text-base font-semibold text-gray-900">Burn dinámico</h3>
      <p className="mt-1 text-sm text-gray-500">
        Porcentaje de fees quemados y tokens eliminados en el último epoch.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-gray-100 p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-500">Burn rate</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {isLoading || !data ? '—' : `${(data.rate * 100).toFixed(1)}%`}
          </p>
        </div>
        <div className="rounded-xl bg-gray-100 p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-500">Último epoch</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {isLoading || !data ? '—' : `${data.lastEpochBurn.toLocaleString()} WFANS`}
          </p>
        </div>
      </div>
    </section>
  );
}
