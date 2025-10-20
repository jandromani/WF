import { WalletActivityItem } from '@/services/wallet';

interface ActivityListProps {
  items?: WalletActivityItem[];
  isLoading?: boolean;
}

const typeLabels: Record<WalletActivityItem['type'], string> = {
  claim: 'Recompensa diaria',
  tip: 'Tip enviado',
  subscribe: 'Suscripción',
  buy: 'Compra',
};

export function ActivityList({ items, isLoading }: ActivityListProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4">
      <h3 className="text-base font-semibold text-gray-900">Actividad reciente</h3>
      <div className="mt-4 space-y-3">
        {isLoading
          ? [1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="animate-pulse rounded-lg bg-gray-100 p-3" />
            ))
          : items?.map((item) => (
              <article key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {typeLabels[item.type]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
                <span
                  className="text-sm font-semibold"
                  aria-label={`${item.amount} WFANS`}
                >
                  {item.amount > 0 ? '+' : ''}
                  {item.amount}
                </span>
              </article>
            ))}
        {!isLoading && !items?.length ? (
          <p className="text-sm text-gray-500">Sin actividad todavía.</p>
        ) : null}
      </div>
    </section>
  );
}
