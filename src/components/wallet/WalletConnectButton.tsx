'use client';

import { Button } from '@/components/common/Button';
import { useWallet } from '@/lib/hooks/useWallet';

export function WalletConnectButton() {
  const { address, balance, status, connect, disconnect, isLoading } = useWallet();
  const loading = isLoading || status === 'connecting';

  if (!address) {
    return (
      <Button size="sm" loading={loading} onClick={() => connect()}>
        Conectar wallet
      </Button>
    );
  }

  const shortAddress = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => disconnect()}
      loading={loading}
      title={`Balance: ${balance.toFixed(4)} WFANS`}
    >
      {shortAddress}
    </Button>
  );
}
