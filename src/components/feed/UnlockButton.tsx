'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useAuthStore } from '@/lib/stores/auth';
import { useNotificationStore } from '@/lib/stores/notifications';

interface UnlockButtonProps {
  postId: string;
  onUnlock: (postId: string) => Promise<unknown>;
}

export function UnlockButton({ postId, onUnlock }: UnlockButtonProps) {
  const { worldIdVerified } = useAuthStore();
  const { showToast } = useToast();
  const addNotification = useNotificationStore((state) => state.add);
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
      addNotification({
        title: 'Contenido desbloqueado',
        body: `Accediste al post ${postId}`,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
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
      data-testid={`unlock-${postId}`}
    >
      Desbloquear
    </Button>
  );
}
