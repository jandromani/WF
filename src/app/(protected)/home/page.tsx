'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

import { useCreators } from '@/lib/hooks/useCreators';
import { useFeed } from '@/lib/hooks/useFeed';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuthStore } from '@/lib/stores/auth';
import { useNotificationStore } from '@/lib/stores/notifications';
import { pay } from '@/services/pay';

type SectionSkeletonProps = {
  className?: string;
};

function SectionSkeleton({ className = 'h-32' }: SectionSkeletonProps) {
  const classes = [
    'w-full',
    'animate-pulse',
    'rounded-2xl',
    'bg-gray-100',
    className,
  ].filter(Boolean);

  return <div aria-hidden="true" className={classes.join(' ')} />;
}

const VerificationGate = dynamic(
  () =>
    import('@/components/VerificationGate').then(
      (mod) => mod.VerificationGate,
    ),
  { ssr: false, suspense: true },
);

const NotificationCenter = dynamic(
  () =>
    import('@/components/NotificationCenter').then(
      (mod) => mod.NotificationCenter,
    ),
  { ssr: false, suspense: true },
);

const UserInfo = dynamic(
  () => import('@/components/UserInfo').then((mod) => mod.UserInfo),
  { ssr: false, suspense: true },
);

const VerifyGate = dynamic(
  () => import('@/components/verify/VerifyGate').then((mod) => mod.VerifyGate),
  { ssr: false, suspense: true },
);

const Pay = dynamic(
  () => import('@/components/Pay').then((mod) => mod.Pay),
  { ssr: false, suspense: true },
);

const QuickActions = dynamic(
  () => import('@/components/QuickActions').then((mod) => mod.QuickActions),
  { ssr: false, suspense: true },
);

const Feed = dynamic(
  () => import('@/components/Feed').then((mod) => mod.Feed),
  { ssr: false, suspense: true },
);

const ViewPermissions = dynamic(
  () =>
    import('@/components/ViewPermissions').then(
      (mod) => mod.ViewPermissions,
    ),
  { ssr: false, suspense: true },
);

const CreatorShowcase = dynamic(
  () =>
    import('@/components/creator/CreatorShowcase').then((mod) => mod.CreatorShowcase),
  { ssr: false, suspense: true },
);

const WalletSummary = dynamic(
  () => import('@/components/WalletSummary').then((mod) => mod.WalletSummary),
  { ssr: false, suspense: true },
);

const ClaimCard = dynamic(
  () => import('@/components/home/ClaimCard').then((mod) => mod.ClaimCard),
  { ssr: false, suspense: true },
);

const BalanceCard = dynamic(
  () =>
    import('@/components/wallet/BalanceCard').then((mod) => mod.BalanceCard),
  { ssr: false, suspense: true },
);

const ActivityList = dynamic(
  () =>
    import('@/components/wallet/ActivityList').then(
      (mod) => mod.ActivityList,
    ),
  { ssr: false, suspense: true },
);

export default function HomePage() {
  const { data: session } = useSession();
  const worldIdVerified = useAuthStore((state) => state.worldIdVerified);
  const { creators = [], subscribeToCreator } = useCreators();
  const { posts = [], create, unlock, isLoading: feedLoading } = useFeed();
  const { balance, activity, isLoading: walletLoading, claim, refresh, addActivity } = useWallet();
  const addNotification = useNotificationStore((state) => state.add);
  const isLoading = walletLoading || feedLoading;

  const resolveCreatorLabel = useCallback(
    (creatorId: string) => {
      const creator = creators.find((item) => item.id === creatorId);
      return creator?.handle ?? creator?.id ?? creatorId;
    },
    [creators],
  );

  const handleSubscribe = async (creatorId: string, price: number) => {
    try {
      await pay({ amount: price, memo: `subscribe:${creatorId}`, type: 'subscribe' });
      const result = await subscribeToCreator(creatorId);
      if (!result.success) {
        return { success: false } as const;
      }
      const label = resolveCreatorLabel(creatorId);
      addNotification({ title: 'Suscripción activa', body: `Apoyas a ${label}` });
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
      const label = resolveCreatorLabel(creatorId);
      addNotification({
        title: 'Tip enviado',
        body: `Enviaste ${amount} WFANS a ${label}`,
      });
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
      addNotification({ title: 'Contenido desbloqueado', body: `Post ${postId} disponible` });
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  const walletBalance = useMemo(() => balance, [balance]);
  const walletActivity = useMemo(() => activity ?? [], [activity]);
  const handleClaim = useCallback(() => claim(), [claim]);
  const claimDisabled = !worldIdVerified || isLoading;

  const user = session?.user;

  const topBarUser = useMemo(() => {
    if (!user) {
      return null;
    }

    const { username, profilePictureUrl } = user;

    return (
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold capitalize">{username}</p>
        <Marble src={profilePictureUrl} className="w-12" />
      </div>
    );
  }, [user]);

  return (
    <div className="space-y-5">
      <TopBar title="Home" endAdornment={topBarUser} />
      <Suspense fallback={<SectionSkeleton className="h-28" />}>
        <VerificationGate />
      </Suspense>
      <Suspense fallback={<SectionSkeleton className="h-24" />}>
        <NotificationCenter />
      </Suspense>
      <Suspense fallback={<SectionSkeleton className="h-24" />}>
        <UserInfo />
      </Suspense>
      <Suspense fallback={<SectionSkeleton className="h-36" />}>
        <VerifyGate />
      </Suspense>
      <Suspense fallback={<SectionSkeleton className="h-40" />}>
        <QuickActions />
      </Suspense>
      <Suspense fallback={<SectionSkeleton className="h-40" />}>
        <Pay />
      </Suspense>
      <div className="grid w-full gap-4 lg:grid-cols-2">
        <Suspense fallback={<SectionSkeleton className="h-32" />}>
          <BalanceCard balance={walletBalance} isLoading={walletLoading} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton className="h-32" />}>
          <ClaimCard disabled={claimDisabled} onClaim={handleClaim} />
        </Suspense>
      </div>
      <Suspense fallback={<SectionSkeleton className="h-48" />}>
        <ActivityList items={walletActivity} isLoading={walletLoading} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton className="h-40" />}>
        <WalletSummary />
      </Suspense>
      <Suspense fallback={<SectionSkeleton className="h-48" />}>
        <Feed
          posts={posts}
          isLoading={feedLoading}
          onCreate={create}
          onUnlock={handleUnlock}
          disableCreate={!worldIdVerified}
        />
      </Suspense>
      <Suspense fallback={<SectionSkeleton className="h-48" />}>
        <CreatorShowcase
          creators={creators}
          onSubscribe={handleSubscribe}
          onTip={(creatorId, amount) => handleTip(creatorId, amount)}
        />
      </Suspense>
      <Suspense fallback={<SectionSkeleton className="h-32" />}>
        <ViewPermissions />
      </Suspense>
    </div>
  );
}
