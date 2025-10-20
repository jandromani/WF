'use client';

import type { Creator } from '@/services/creators';
import { SubscribeButton } from '@/components/Creators/SubscribeButton';
import { TipButton } from '@/components/Creators/TipButton';

interface Props {
  creator: Creator;
}

export const CreatorCard = ({ creator }: Props) => {
  return (
    <div className="flex w-full flex-col gap-3 rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <p className="text-lg font-semibold text-slate-900">{creator.displayName}</p>
          <p className="text-sm text-slate-500">{creator.handle}</p>
          <p className="mt-2 text-sm text-slate-600">{creator.tierDescription}</p>
        </div>
        <div className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {creator.subscribers.toLocaleString()} subs
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SubscribeButton
          creatorId={creator.id}
          price={creator.subscriptionPrice}
          disabled={creator.isSubscribed}
        />
        <TipButton creatorId={creator.id} options={creator.tipOptions} />
      </div>
      {creator.isSubscribed && (
        <p className="text-xs font-medium text-emerald-600">
          You are subscribed to this creator.
        </p>
      )}
    </div>
  );
};
