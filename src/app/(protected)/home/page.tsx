'use client';

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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Tu panel</h1>
      <BalanceCard balance={balance} isLoading={isLoading} />
      <ClaimCard disabled={!worldIdVerified} onClaim={claim} />
      <ActivityList items={activity} isLoading={isLoading} />
    </div>
  );
}
