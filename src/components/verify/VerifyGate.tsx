'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useAuthStore } from '@/lib/stores/auth';
import { MiniKit } from '@worldcoin/minikit-js';

const ACTION_ID = 'wfans-create-account';

interface VerifyGateProps {
  className?: string;
}

export function VerifyGate({ className }: VerifyGateProps) {
  const { worldIdVerified, setWorldIdVerified } = useAuthStore();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || worldIdVerified) {
    return null;
  }

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await MiniKit.commandsAsync.verify({
        action: ACTION_ID,
      });

      const proofResponse = await fetch('/api/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: response,
          action: ACTION_ID,
          signal: undefined,
        }),
      });

      const payload = await proofResponse.json();
      const success = proofResponse.ok && payload?.verifyRes?.success;

      if (!success) {
        throw new Error('Verification failed');
      }

      setWorldIdVerified(true);
      showToast('Verificación completada', 'success');
    } catch (error) {
      console.error(error);
      showToast('No se pudo completar la verificación', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-800 ${className ?? ''}`}
    >
      <h2 className="text-base font-semibold">Verifica tu World ID</h2>
      <p className="mt-2 text-sm">
        Confirma que eres una persona única para reclamar recompensas, publicar y
        desbloquear contenido premium.
      </p>
      <Button className="mt-4" onClick={handleVerify} loading={loading}>
        Verificar con World ID
      </Button>
    </section>
  );
}
