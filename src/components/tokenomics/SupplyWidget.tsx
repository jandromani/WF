import { SupplyStats } from '@/services/tokenomics';

interface SupplyWidgetProps {
  data?: SupplyStats;
  isLoading?: boolean;
}

export function SupplyWidget({ data, isLoading }: SupplyWidgetProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="text-base font-semibold text-gray-900">Oferta de WFANS</h3>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {[
          { label: 'Circulante', value: data?.circulating },
          { label: 'Total', value: data?.total },
          { label: 'Quemado', value: data?.burned },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-gray-100 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {isLoading || item.value === undefined
                ? '—'
                : item.value.toLocaleString('es-ES')}{' '}
              <span className="text-xs font-medium text-gray-500">WFANS</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
