'use client';

import { CreatorHeader } from '@/components/creator/CreatorHeader';
import { SubscribeButton } from '@/components/creator/SubscribeButton';
import { TipButton } from '@/components/creator/TipButton';
import { BuyWFANSButton } from '@/components/wallet/BuyWFANSButton';
import { useCreator } from '@/lib/hooks/useCreators';

interface CreatorProfileViewProps {
  id: string;
}

export function CreatorProfileView({ id }: CreatorProfileViewProps) {
  const { creator, isLoading, subscribe, tip } = useCreator(id);

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />;
  }

  if (!creator) {
    return <p className="text-sm text-gray-500">No encontramos a este creador.</p>;
  }

  return (
    <div className="space-y-4">
      <CreatorHeader creator={creator} />
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">Suscríbete</h2>
        <p className="mt-1 text-sm text-gray-500">
          Accede a contenido exclusivo y eventos privados.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <SubscribeButton
            creatorId={creator.id}
            price={creator.subscriptionPrice}
            onSubscribe={subscribe}
          />
          <BuyWFANSButton />
        </div>
      </section>

      {creator.tippingOptions.length ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Enviar tip</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {creator.tippingOptions.map((amount) => (
              <TipButton key={amount} amount={amount} onTip={() => tip(amount)} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
