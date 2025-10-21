import { memo } from 'react';

import { CreatorProfile } from '@/services/creators';

interface CreatorHeaderProps {
  creator: Creator;
}

const CreatorHeaderComponent = ({ creator }: CreatorHeaderProps) => {
  return (
    <header className="flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-6 text-white">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-white/20 text-center">
          <span className="flex h-full w-full items-center justify-center text-xl font-semibold">
            {creator.id[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{creator.handle}</h1>
          <p className="text-sm text-white/80">{creator.subscribers} fans</p>
        </div>
      </div>
      <dl className="flex gap-6 text-sm">
        <div>
          <dt className="text-white/70">Suscriptores</dt>
          <dd className="text-lg font-semibold">{creator.subscribers}</dd>
        </div>
        <div>
          <dt className="text-white/70">Precio</dt>
          <dd className="text-lg font-semibold">{creator.price} WFANS/mes</dd>
        </div>
      </dl>
    </header>
  );
};

export const CreatorHeader = memo(CreatorHeaderComponent);
CreatorHeader.displayName = 'CreatorHeader';
