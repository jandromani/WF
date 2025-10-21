'use client';

import { CreatorShowcase } from '@/components/creator/CreatorShowcase';
import { Composer } from '@/components/feed/Composer';
import { FeedList } from '@/components/feed/FeedList';
import { NotificationCenter } from '@/components/NotificationCenter';
import { ClaimCard } from '@/components/home/ClaimCard';
import { ActivityList } from '@/components/wallet/ActivityList';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { BuyWFANSButton } from '@/components/wallet/BuyWFANSButton';
import { VerifyGate } from '@/components/verify/VerifyGate';
import { useCreators } from '@/lib/hooks/useCreators';
import { useFeed } from '@/lib/hooks/useFeed';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuthStore } from '@/lib/stores/auth';
import { useNotificationStore } from '@/lib/stores/notifications';
import { pay } from '@/services/pay';

export default function HomePage() {
  const worldIdVerified = useAuthStore((state) => state.worldIdVerified);
  const { creators = [], subscribeToCreator } = useCreators();
  const { posts = [], create, unlock, isLoading: feedLoading } = useFeed();
  const { balance, activity, isLoading: walletLoading, claim, refresh, addActivity } = useWallet();
  const addNotification = useNotificationStore((state) => state.add);

  const handleSubscribe = async (creatorId: string, price: number) => {
    try {
      await pay({ amount: price, memo: `subscribe:${creatorId}`, type: 'subscribe' });
      await subscribeToCreator(creatorId);
      addNotification({ title: 'Suscripción activa', body: `Apoyas a ${creatorId}` });
      await refresh();
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  const handleTip = async (creatorId: string, amount: number) => {
    try {
      await pay({ amount, memo: `tip:${creatorId}`, type: 'tip' });
      await refresh();
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  const handleUnlock = async (postId: string) => {
    const post = posts.find((item) => item.id === postId);
    try {
      if (post?.price) {
        await pay({ amount: post.price, memo: `unlock:${postId}`, type: 'unlock' });
        await refresh();
      } else {
        await addActivity({ type: 'unlock', amount: post?.price, meta: `unlock:${postId}` });
      }
      await unlock(postId);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <VerifyGate />
      <NotificationCenter />
      <section className="grid gap-4">
        <BalanceCard balance={balance} isLoading={walletLoading} />
        <div className="grid gap-4 md:grid-cols-2">
          <ClaimCard disabled={!worldIdVerified} onClaim={claim} />
          <BuyWFANSButton disabled={!worldIdVerified} />
        </div>
        <ActivityList items={activity} isLoading={walletLoading} />
      </section>
      <section className="grid gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Creadores destacados</h2>
        <CreatorShowcase creators={creators} onSubscribe={handleSubscribe} onTip={handleTip} />
      </section>
      <section className="grid gap-4">
        <Composer onSubmit={create} disabled={!worldIdVerified} />
        <FeedList
          posts={posts}
          isLoading={feedLoading}
          onUnlock={async (postId) => {
            await handleUnlock(postId);
          }}
        />
      </section>
    </div>
  );
}
