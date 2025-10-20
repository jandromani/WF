import { auth } from '@/auth';
import { CreatorShowcase } from '@/components/Creators';
import { FeedList } from '@/components/Feed/FeedList';
import { Page } from '@/components/PageLayout';
import { Transaction } from '@/components/Transaction';
import { UserInfo } from '@/components/UserInfo';
import { Verify } from '@/components/Verify';
import { ViewPermissions } from '@/components/ViewPermissions';
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
      <Page.Main className="mb-16 flex flex-col items-center justify-start gap-6">
        <UserInfo />
        <Verify />
        <CreatorShowcase />
        <FeedList />
        <Transaction />
        <ViewPermissions />
      </Page.Main>
    </>
  );
}
