'use client';

import { SubscribeButton } from '@/components/creator/SubscribeButton';
import { TipButton } from '@/components/creator/TipButton';
import { CreatorHeader } from '@/components/creator/CreatorHeader';
import { useCreator } from '@/lib/hooks/useCreators';
import { useWallet } from '@/lib/hooks/useWallet';
import { useNotificationStore } from '@/lib/stores/notifications';
import { pay } from '@/services/pay';

interface CreatorProfileViewProps {
  id: string;
}

export function CreatorProfileView({ id }: CreatorProfileViewProps) {
  const { creator, isLoading, subscribe } = useCreator(id);
  const { refresh } = useWallet();
  const addNotification = useNotificationStore((state) => state.add);

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />;
  }

  if (!creator) {
    return <p className="text-sm text-gray-500">No encontramos a este creador.</p>;
  }

  const handleSubscribe = async (creatorId: string, price: number) => {
    try {
      await pay({ amount: price, memo: `subscribe:${creatorId}`, type: 'subscribe' });
      await subscribe();
      await refresh();
      addNotification({ title: 'Suscripción activa', body: `Apoyas a ${creatorId}` });
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  const handleTip = async (amount: number) => {
    try {
      await pay({ amount, memo: `tip:${creator.id}`, type: 'tip' });
      await refresh();
      addNotification({ title: 'Tip enviado', body: `Enviaste ${amount} WFANS a ${creator.id}` });
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  return (
    <div className="space-y-4">
      <CreatorHeader creator={creator} />
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">Suscríbete</h2>
        <p className="mt-1 text-sm text-gray-500">
          Accede a contenido exclusivo y eventos privados.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <SubscribeButton creatorId={creator.id} price={creator.price} onSubscribe={handleSubscribe} />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">Enviar tip</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[5, 10, 20].map((amount) => (
            <TipButton key={amount} creatorId={creator.id} amount={amount} onTip={handleTip} />
          ))}
        </div>
      </section>
    </div>
  );
}
