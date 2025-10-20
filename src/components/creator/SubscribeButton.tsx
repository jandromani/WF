'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useAuthStore } from '@/lib/stores/auth';

interface SubscribeButtonProps {
  creatorId: string;
  price: number;
  onSubscribe: (id: string, price: number) => Promise<{ success: boolean }>;
}

export function SubscribeButton({ creatorId, price, onSubscribe }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { worldIdVerified } = useAuthStore();

  const handleSubscribe = async () => {
    if (!worldIdVerified) {
      showToast('Verifica tu World ID para suscribirte', 'info');
      return;
    }

    setLoading(true);
    try {
      const result = await onSubscribe(creatorId, price);
      if (result.success) {
        showToast('Suscripción completada en World App', 'success');
      } else {
        showToast('No se pudo completar la suscripción', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error al suscribirse', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSubscribe} loading={loading} disabled={!worldIdVerified}>
      Suscribirse · {price} WFANS/mes
    </Button>
  );
}
