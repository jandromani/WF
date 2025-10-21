'use client';

import { useWallet } from '@/lib/hooks/useWallet';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { ActivityList } from '@/components/wallet/ActivityList';
import { BuyWFANSButton } from '@/components/wallet/BuyWFANSButton';
import { ClaimCard } from '@/components/home/ClaimCard';
import { useAuthStore } from '@/lib/stores/auth';

export default function WalletPage() {
  const { balance, activity, isLoading, claim } = useWallet();
  const worldIdVerified = useAuthStore((state) => state.worldIdVerified);

  return (
    <div className="space-y-4 pb-16">
      <BalanceCard balance={balance} isLoading={isLoading} />
      <div className="grid gap-4 md:grid-cols-2">
        <ClaimCard disabled={!worldIdVerified} onClaim={claim} />
        <BuyWFANSButton disabled={!worldIdVerified} />
      </div>
      <ActivityList items={activity} isLoading={isLoading} />
    </div>
  );
}
