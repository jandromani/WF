'use client';

import { creators } from '@/services/creators';
import { pay } from '@/services/pay';
import { useState } from 'react';

type Props = {
  creatorId: string;
  price: number;
  disabled?: boolean;
};

export const SubscribeButton = ({ creatorId, price, disabled }: Props) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle',
  );

  const handleSubscribe = async () => {
    setStatus('pending');
    try {
      await pay({ amount: price, memo: `sub:${creatorId}` });
      await creators.subscribe(creatorId, price);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Subscription failed', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={disabled || status === 'pending'}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {status === 'pending' && 'Subscribing…'}
        {status === 'idle' && `Subscribe · ${price} WLDY`}
        {status === 'success' && 'Subscribed'}
        {status === 'error' && 'Try again'}
      </button>
      {status === 'pending' && (
        <span className="text-xs text-slate-500">Awaiting confirmation…</span>
      )}
      {status === 'success' && (
        <span className="text-xs text-emerald-600">Subscription confirmed</span>
      )}
      {status === 'error' && (
        <span className="text-xs text-rose-500">
          Payment failed. Please retry.
        </span>
      )}
    </div>
  );
};
