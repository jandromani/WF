import { auth } from '@/auth';
import { CreatorShowcase } from '@/components/Creators';
import { FeedList } from '@/components/Feed/FeedList';
import { Page } from '@/components/PageLayout';
import { Pay } from '@/components/Pay';
import { UserInfo } from '@/components/UserInfo';
import { VerifyGate } from '@/components/verify/VerifyGate';
import { ViewPermissions } from '@/components/ViewPermissions';
import { ClaimCard } from '@/components/ClaimCard';
import { Feed } from '@/components/Feed';
import { NotificationCenter } from '@/components/NotificationCenter';
import { QuickActions } from '@/components/QuickActions';
import { VerificationGate } from '@/components/VerificationGate';
import { WalletSummary } from '@/components/WalletSummary';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

import { useEffect } from 'react';

import { BalanceCard } from '@/components/wallet/BalanceCard';
import { ActivityList } from '@/components/wallet/ActivityList';
import { ClaimCard } from '@/components/home/ClaimCard';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuthStore } from '@/lib/stores/auth';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const worldIdVerified = useAuthStore((state) => state.worldIdVerified);
  const { balance, activity, claim, isLoading } = useWallet();

  useEffect(() => {
    if (worldIdVerified) {
      router.replace('/feed');
    }
  }, [router, worldIdVerified]);

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Home"
          endAdornment={
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold capitalize">
                {session?.user.username}
              </p>
              <Marble src={session?.user.profilePictureUrl} className="w-12" />
            </div>
          }
        />
      </Page.Header>
      <Page.Main className="relative flex flex-col items-center justify-start gap-4 mb-16">
        <VerificationGate />
        <NotificationCenter />
        <UserInfo />
        <VerifyGate />
        <Pay />
        <QuickActions />
        <Feed />
        <ViewPermissions />
      </Page.Main>
    </>
  );
}
