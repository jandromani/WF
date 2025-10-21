'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useNotificationStore } from '@/lib/stores/notifications';

interface ClaimCardProps {
  disabled?: boolean;
  onClaim: () => Promise<{ success: boolean; amount: number }>;
}

export function ClaimCard({ disabled, onClaim }: ClaimCardProps) {
  const { showToast } = useToast();
  const addNotification = useNotificationStore((state) => state.add);
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const result = await onClaim();
      if (result.success) {
        showToast(`Reclamaste ${result.amount} WFANS`, 'success');
        addNotification({ title: 'Claim completado', body: `Sumaste ${result.amount} WFANS` });
      } else {
        showToast('No se pudo reclamar la recompensa', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error al reclamar la recompensa', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Claim diario</h2>
          <p className="text-sm text-gray-500">
            Reclama tu recompensa diaria por apoyar a los creadores.
          </p>
        </div>
        <Button
          onClick={handleClaim}
          disabled={disabled}
          loading={loading}
          className="md:self-start"
          data-testid="claim-action"
        >
          Reclamar
        </Button>
      </div>
      {disabled ? (
        <p className="mt-3 text-xs text-amber-500">
          Verifica tu identidad con World ID para reclamar.
        </p>
      ) : null}
    </section>
  );
}
