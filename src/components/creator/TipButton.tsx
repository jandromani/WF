'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { Confirm } from '@/components/common/Confirm';
import { useToast } from '@/components/common/Toast';
import { useAuthStore } from '@/lib/stores/auth';
import { useNotificationStore } from '@/lib/stores/notifications';

interface TipButtonProps {
  creatorId: string;
  amount: number;
  onTip: (amount: number) => Promise<{ success: boolean }>;
}

export function TipButton({ creatorId, amount, onTip }: TipButtonProps) {
  const [loading, setLoading] = useState(false);
  const { worldIdVerified } = useAuthStore();
  const { showToast } = useToast();
  const addNotification = useNotificationStore((state) => state.add);

  return (
    <Confirm
      title={`Enviar tip de ${amount} WFANS`}
      description="Confirmaremos la transacción en World App."
      onConfirm={async () => {
        if (!worldIdVerified) {
          showToast('Verifica tu World ID para enviar tips', 'info');
          return;
        }
        setLoading(true);
        try {
          const result = await onTip(amount);
          if (result.success) {
            showToast('Tip enviado', 'success');
            addNotification({
              title: 'Tip enviado',
              body: `Enviaste ${amount} WFANS a ${creatorId}`,
            });
          } else {
            showToast('No se pudo enviar el tip', 'error');
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error(error);
          }
          showToast('Error al enviar el tip', 'error');
        } finally {
          setLoading(false);
        }
      }}
      trigger={({ open }) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (!worldIdVerified) {
              showToast('Verifica tu World ID para enviar tips', 'info');
              return;
            }
            open();
          }}
          loading={loading}
          disabled={!worldIdVerified}
          data-testid={`tip-${creatorId}-${amount}`}
        >
          {amount} WFANS
        </Button>
      )}
    />
  );
}
