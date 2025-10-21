'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useAuthStore } from '@/lib/stores/auth';
import { useNotificationStore } from '@/lib/stores/notifications';

interface SubscribeButtonProps {
  creatorId: string;
  price: number;
  onSubscribe: (id: string, price: number) => Promise<{ success: boolean }>;
}

export function SubscribeButton({ creatorId, price, onSubscribe }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const addNotification = useNotificationStore((state) => state.add);
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
        addNotification({
          title: 'Suscripción activa',
          body: `Te suscribiste a ${creatorId}`,
        });
      } else {
        showToast('No se pudo completar la suscripción', 'error');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
      showToast('Error al suscribirse', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      loading={loading}
      disabled={!worldIdVerified}
      data-testid={`subscribe-${creatorId}`}
    >
      Suscribirse · {price} WFANS/mes
    </Button>
  );
}
