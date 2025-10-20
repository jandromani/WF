import { EpochStats } from '@/services/tokenomics';

interface EpochWidgetProps {
  data?: EpochStats;
  isLoading?: boolean;
}

export function EpochWidget({ data, isLoading }: EpochWidgetProps) {
  const progress = Math.min(1, Math.max(0, data?.progress ?? 0));
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Epoch #{data?.id ?? '—'}</h3>
          <p className="text-sm text-gray-500">
            El epoch actual define las recompensas de creadores y fans.
          </p>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {isLoading || !data ? '—' : `${Math.round(progress * 100)}%`}
        </span>
      </div>
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      {data?.endsAt ? (
        <p className="mt-3 text-xs text-gray-500">
          Finaliza el {new Date(data.endsAt).toLocaleString()}.
        </p>
      ) : null}
    </section>
  );
}
