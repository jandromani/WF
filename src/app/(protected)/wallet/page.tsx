import { Page } from '@/components/PageLayout';
import { ActivityList, BalanceCard, BuyWFANSButton } from '@/components/Wallet';
import { auth } from '@/auth';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default async function WalletPage() {
  const session = await auth();

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Wallet"
          endAdornment={
            session?.user ? (
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold capitalize">
                  {session.user.username}
                </p>
                <Marble src={session.user.profilePictureUrl} className="w-12" />
              </div>
            ) : null
          }
        />
      </Page.Header>
      <Page.Main className="mb-16 flex flex-col items-center justify-start gap-5">
        <BalanceCard />
        <ActivityList />
        <BuyWFANSButton />
      </Page.Main>
    </>
  );
}
