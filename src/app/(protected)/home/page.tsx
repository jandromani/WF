import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { Pay } from '@/components/Pay';
import { UserInfo } from '@/components/UserInfo';
import { Verify } from '@/components/Verify';
import { ViewPermissions } from '@/components/ViewPermissions';
import { ClaimCard } from '@/components/ClaimCard';
import { Feed } from '@/components/Feed';
import { NotificationCenter } from '@/components/NotificationCenter';
import { QuickActions } from '@/components/QuickActions';
import { VerificationGate } from '@/components/VerificationGate';
import { WalletSummary } from '@/components/WalletSummary';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default async function Home() {
  const session = await auth();

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
        <Verify />
        <ClaimCard />
        <WalletSummary />
        <Pay />
        <QuickActions />
        <Feed />
        <ViewPermissions />
      </Page.Main>
    </>
  );
}
