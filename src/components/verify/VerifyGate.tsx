'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import clsx from 'clsx';
import { useState } from 'react';

import { verify } from '@/lib/minikit';
import { useAuthStore } from '@/lib/stores/auth';

type VerifyState = 'idle' | 'pending' | 'success' | 'error';

interface VerifyGateProps {
  className?: string;
}

const ACTION_ID = process.env.NEXT_PUBLIC_ACTION_ID ?? 'wfans-create-account';

export function VerifyGate({ className }: VerifyGateProps) {
  const worldIdVerified = useAuthStore((state) => state.worldIdVerified);
  const setWorldIdVerified = useAuthStore((state) => state.setWorldIdVerified);
  const [state, setState] = useState<VerifyState>('idle');

  const handleVerify = async () => {
    if (state === 'pending' || worldIdVerified) {
      return;
    }

    setState('pending');

    try {
      const result = await verify(ACTION_ID);
      const status = result?.finalPayload?.status;

      if (status !== 'success') {
        throw new Error('Verification failed');
      }

      setState('success');
      setWorldIdVerified(true);
    } catch (error) {
      console.error('Verification error', error);
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  if (worldIdVerified) {
    return null;
  }

  return (
    <div
      data-testid="verification-gate"
      className={clsx(
        'flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="grid gap-2 text-center">
        <p className="text-lg font-semibold">Verifica tu World ID</p>
        <p className="text-sm text-slate-600">
          Para continuar necesitamos confirmar tu verificación en World App.
        </p>
      </div>
      <Button
        data-testid="verify-cta"
        size="lg"
        variant="primary"
        className="w-full"
        disabled={state === 'pending'}
        onClick={handleVerify}
      >
        Verificar con World ID
      </Button>
      {state === 'error' ? (
        <p className="text-center text-xs text-red-500">No pudimos verificarte. Intenta nuevamente.</p>
      ) : null}
      {state === 'success' ? (
        <p className="text-center text-xs text-emerald-500">¡Listo! Ya puedes usar todas las funciones.</p>
      ) : null}
    </div>
  );
}
