'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { env } from '@/lib/env';
import { buyWFANS } from '@/services/wallet';

interface BuyWFANSButtonProps {
  disabled?: boolean;
}

export function BuyWFANSButton({ disabled }: BuyWFANSButtonProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleBuy = async () => {
    setLoading(true);
    try {
      await buyWFANS(50);
      showToast('Abriendo flujo de compra en Dexscreener', 'success');
      const url = env.contracts.token
        ? `https://dexscreener.com/worldchain/${env.contracts.token}`
        : 'https://dexscreener.com/worldchain';
      window.open(url, '_blank');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
      showToast('No se pudo iniciar la compra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleBuy} disabled={disabled} loading={loading} variant="secondary">
      Comprar WFANS
    </Button>
  );
}
