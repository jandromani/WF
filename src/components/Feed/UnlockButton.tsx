'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useAuthStore } from '@/lib/stores/auth';

interface UnlockButtonProps {
  postId: string;
  onUnlock: (postId: string) => Promise<unknown>;
}

export function UnlockButton({ postId, onUnlock }: UnlockButtonProps) {
  const { worldIdVerified } = useAuthStore();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!worldIdVerified) {
      showToast('Verifica tu identidad para desbloquear contenido', 'info');
      return;
    }

    setLoading(true);
    try {
      await onUnlock(postId);
      showToast('Contenido desbloqueado', 'success');
    } catch (error) {
      console.error(error);
      showToast('No se pudo desbloquear el contenido', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={handleUnlock}
      loading={loading}
      disabled={!worldIdVerified}
    >
      Desbloquear
    </Button>
  );
}
