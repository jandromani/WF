import { Activity } from '@/services/wallet';

interface ActivityListProps {
  items?: Activity[];
  isLoading?: boolean;
}

const labels: Record<Activity['type'], string> = {
  claim: 'Recompensa diaria',
  tip: 'Tip enviado',
  subscribe: 'Suscripción',
  unlock: 'Desbloqueo',
  referral: 'Invitación',
};

export function ActivityList({ items, isLoading }: ActivityListProps) {
  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-4"
      data-testid="wallet-activity"
    >
      <h3 className="text-base font-semibold text-gray-900">Actividad reciente</h3>
      <div className="mt-4 space-y-3">
        {isLoading
          ? [1, 2, 3].map((placeholder) => (
              <div key={placeholder} className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ))
          : items?.map((item) => (
              <article
                key={item.id}
                className="flex items-center justify-between"
                data-testid="wallet-activity-item"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{labels[item.type]}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.ts).toLocaleString('es-ES')}
                  </p>
                </div>
                {item.amount !== undefined ? (
                  <span className="text-sm font-semibold">
                    {item.amount > 0 ? '+' : ''}
                    {item.amount} WFANS
                  </span>
                ) : null}
              </article>
            ))}
        {!isLoading && !items?.length ? (
          <p className="text-sm text-gray-500">Sin actividad todavía.</p>
        ) : null}
      </div>
    </section>
  );
}
