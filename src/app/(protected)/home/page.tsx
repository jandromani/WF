'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

import { Page } from '@/components/PageLayout';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuthStore } from '@/lib/stores/auth';

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
    import('@/components/Creators').then((mod) => mod.CreatorShowcase),
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
  const router = useRouter();
  const { data: session } = useSession();
  const worldIdVerified = useAuthStore((state) => state.worldIdVerified);
  const { balance, activity, claim, isLoading } = useWallet();

  useEffect(() => {
    if (worldIdVerified) {
      router.replace('/feed');
    }
  }, [router, worldIdVerified]);

  const walletBalance = useMemo(() => balance, [balance]);
  const walletActivity = useMemo(() => activity, [activity]);
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
    <>
      <Page.Header className="p-0">
        <TopBar title="Home" endAdornment={topBarUser} />
      </Page.Header>
      <Page.Main className="mb-16 flex flex-col items-center justify-start gap-4">
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
            <BalanceCard balance={walletBalance} isLoading={isLoading} />
          </Suspense>
          <Suspense fallback={<SectionSkeleton className="h-32" />}>
            <ClaimCard disabled={claimDisabled} onClaim={handleClaim} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionSkeleton className="h-48" />}>
          <ActivityList items={walletActivity} isLoading={isLoading} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton className="h-40" />}>
          <WalletSummary />
        </Suspense>
        <Suspense fallback={<SectionSkeleton className="h-48" />}>
          <Feed />
        </Suspense>
        <Suspense fallback={<SectionSkeleton className="h-48" />}>
          <CreatorShowcase />
        </Suspense>
        <Suspense fallback={<SectionSkeleton className="h-32" />}>
          <ViewPermissions />
        </Suspense>
      </Page.Main>
    </>
  );
}
