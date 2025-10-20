'use client';

import { pay } from '@/services/pay';
import { useState } from 'react';

export const BuyWFANSButton = () => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle',
  );

  const [amount, setAmount] = useState(25);

  const resetLater = () => {
    setTimeout(() => setStatus('idle'), 2500);
  };

  const handleBuy = async () => {
    setStatus('pending');
    try {
      await pay({ amount, memo: 'buy_wfans' });
      setStatus('success');
      resetLater();
    } catch (error) {
      console.error('Failed to buy WFANS', error);
      setStatus('error');
      resetLater();
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600">Buy WFANS</p>
          <p className="text-xs text-slate-500">
            Purchase WFANS instantly using MiniKit pay
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500" htmlFor="wfans-amount">
            Amount
          </label>
          <input
            id="wfans-amount"
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value) || 0)}
            className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-right text-sm font-semibold text-slate-700 focus:border-slate-400 focus:outline-none"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleBuy}
        disabled={status === 'pending' || amount <= 0}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-sm font-semibold text-white shadow-md transition hover:from-blue-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'pending' && 'Processing…'}
        {status === 'idle' && 'Buy WFANS'}
        {status === 'success' && 'Purchased'}
        {status === 'error' && 'Try again'}
      </button>
    </div>
  );
};
