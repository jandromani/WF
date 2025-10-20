'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useWallet } from '@/lib/hooks/useWallet';

interface BuyWFANSButtonProps {
  disabled?: boolean;
}

export function BuyWFANSButton({ disabled }: BuyWFANSButtonProps) {
  const { buy } = useWallet();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await buy();
      if (result.success) {
        showToast('Compra iniciada en World App', 'success');
      } else {
        showToast('No se pudo iniciar la compra', 'error');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
      showToast('Error al iniciar la compra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} loading={loading} disabled={disabled} size="lg">
      Comprar WFANS
    </Button>
  );
}
