import { SubscribeButton } from '@/components/creator/SubscribeButton';
import { TipButton } from '@/components/creator/TipButton';
import { Creator } from '@/services/creators';

interface CreatorCardProps {
  creator: Creator;
  onSubscribe: (id: string, price: number) => Promise<{ success: boolean }>;
  onTip: (id: string, amount: number) => Promise<{ success: boolean }>;
}

const tipOptions = [5, 10, 20];

export function CreatorCard({ creator, onSubscribe, onTip }: CreatorCardProps) {
  return (
    <article className="flex w-full flex-col gap-3 rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">{creator.handle}</p>
          <p className="text-sm text-slate-500">
            {creator.price} WFANS/mes · {creator.subscribers} fans
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          <span className="flex h-full w-full items-center justify-center text-lg font-semibold">
            {creator.id[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
      </header>
      <SubscribeButton
        creatorId={creator.id}
        price={creator.price}
        onSubscribe={onSubscribe}
      />
      <div className="flex flex-wrap gap-2">
        {tipOptions.map((amount) => (
          <TipButton
            key={amount}
            creatorId={creator.id}
            amount={amount}
            onTip={(value) => onTip(creator.id, value)}
          />
        ))}
      </div>
    </article>
  );
}
