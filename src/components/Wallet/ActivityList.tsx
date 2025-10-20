'use client';

import { useWallet } from '@/providers/WalletProvider';

const typeLabels: Record<string, { label: string; accent: string }> = {
  daily_claim: { label: 'Daily Claim', accent: 'text-emerald-500' },
  subscription: { label: 'Subscription', accent: 'text-rose-500' },
  tip: { label: 'Tip', accent: 'text-orange-500' },
  referral: { label: 'Referral', accent: 'text-sky-500' },
  unlock: { label: 'Unlock', accent: 'text-violet-500' },
  buy_wfans: { label: 'Buy WFANS', accent: 'text-blue-500' },
  other: { label: 'Activity', accent: 'text-slate-500' },
};

const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const ActivityList = () => {
  const { activities } = useWallet();

  return (
    <div className="w-full rounded-2xl border border-slate-200/50 bg-white/70 p-4 shadow-sm backdrop-blur">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Activity
      </p>
      <ul className="flex flex-col divide-y divide-slate-200/70 text-sm">
        {activities.map((activity) => {
          const meta = typeLabels[activity.type] ?? typeLabels.other;
          const amountPrefix = activity.direction === 'out' ? '-' : '+';

          return (
            <li
              key={activity.id}
              className="flex items-center justify-between py-3 text-slate-900"
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  <span className={meta.accent}>{meta.label}</span>
                  {activity.counterparty ? ` · ${activity.counterparty}` : ''}
                </span>
                <span className="text-xs text-slate-500">
                  {activity.description ?? activity.memo}
                </span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-800">
                  {amountPrefix}
                  {activity.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  WLDY
                </p>
                <p className="text-xs text-slate-400">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
