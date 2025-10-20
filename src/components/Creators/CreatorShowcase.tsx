'use client';

import { CreatorCard } from '@/components/Creators/CreatorCard';
import { useCreatorsStore } from '@/services/creators';

export const CreatorShowcase = () => {
  const { creators } = useCreatorsStore();

  return (
    <section className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Featured creators
        </p>
        <h2 className="text-xl font-semibold text-slate-900">
          Subscribe and tip your favorites
        </h2>
      </header>
      <div className="flex flex-col gap-4">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>
    </section>
  );
};
