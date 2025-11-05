'use client';

import { Activity } from '@/services/wallet';

interface ActivityListProps {
  items?: Activity[];
  isLoading?: boolean;
}

const labels: Record<Activity['type'], string> = {
  claim: 'Recompensa reclamada',
  tip: 'Tip enviado',
  subscribe: 'Suscripción',
  unlock: 'Contenido desbloqueado',
  referral: 'Invitación completada',
};

export function ActivityList({ items = [], isLoading }: ActivityListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="wallet-activity">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Actividad</h2>
        {isLoading ? <span className="text-xs text-slate-400">Actualizando…</span> : null}
      </header>
      <ul className="space-y-3" data-testid="wallet-activity-list">
        {items.map((item) => (
          <li
            key={item.id}
            data-testid="wallet-activity-item"
            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600"
          >
            <p className="font-semibold text-slate-900">{labels[item.type]}</p>
            {item.amount ? <p>{item.amount} WFANS</p> : null}
            {item.meta ? <p className="text-slate-500">{item.meta}</p> : null}
            <p className="text-[11px] text-slate-400">
              {new Date(item.ts).toLocaleString('es-ES')}
            </p>
          </li>
        ))}
        {!items.length ? (
          <li className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
            No hay movimientos recientes.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
