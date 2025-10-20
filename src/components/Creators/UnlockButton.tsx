'use client';

import type { Post } from '@/services/feed';
import { feed } from '@/services/feed';
import { pay } from '@/services/pay';
import { useState } from 'react';

type Props = {
  post: Post;
};

export const UnlockButton = ({ post }: Props) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    'idle',
  );

  const handleUnlock = async () => {
    setStatus('pending');
    try {
      await pay({ amount: post.price, memo: `unlock:${post.id}` });
      await feed.unlockPost(post.id);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Unlock failed', error);
      }
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3500);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleUnlock}
        disabled={status === 'pending'}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-violet-300"
      >
        {status === 'pending' && 'Unlocking…'}
        {status === 'idle' && `Unlock for ${post.price} WLDY`}
        {status === 'success' && 'Unlocked'}
        {status === 'error' && 'Try again'}
      </button>
      {status === 'pending' && (
        <span className="text-xs text-slate-500">Confirming payment…</span>
      )}
      {status === 'success' && (
        <span className="text-xs text-emerald-600">Content unlocked</span>
      )}
      {status === 'error' && (
        <span className="text-xs text-rose-500">Unlock failed. Please retry.</span>
      )}
    </div>
  );
};
