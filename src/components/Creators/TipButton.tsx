'use client';

import { creators } from '@/services/creators';
import { pay } from '@/services/pay';
import { useState } from 'react';

type Props = {
  creatorId: string;
  options: number[];
};

export const TipButton = ({ creatorId, options }: Props) => {
  const [amount, setAmount] = useState(options[0] ?? 1);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle',
  );

  const handleTip = async () => {
    setStatus('pending');
    try {
      await pay({ amount, memo: `tip:${creatorId}` });
      await creators.tip(creatorId, amount);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (error) {
      console.error('Tip failed', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3500);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm">
        <label className="text-xs font-medium text-slate-500" htmlFor={`tip-${creatorId}`}>
          Tip amount
        </label>
        <select
          id={`tip-${creatorId}`}
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value))}
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-600 focus:border-slate-400 focus:outline-none"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option} WLDY
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleTip}
        disabled={status === 'pending'}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-900 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
      >
        {status === 'pending' && 'Sending tip…'}
        {status === 'idle' && `Tip ${amount} WLDY`}
        {status === 'success' && 'Tip sent'}
        {status === 'error' && 'Try again'}
      </button>
      {status === 'pending' && (
        <span className="text-xs text-slate-500">Confirming in MiniKit…</span>
      )}
      {status === 'success' && (
        <span className="text-xs text-emerald-600">Tip delivered</span>
      )}
      {status === 'error' && (
        <span className="text-xs text-rose-500">Tip failed. Please retry.</span>
      )}
    </div>
  );
};
