'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import clsx from 'clsx';
import { useState } from 'react';

import { verify } from '@/lib/minikit';
import { useAuthStore } from '@/lib/stores/auth';
import { postProof } from '@/lib/worldid';

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

      const response = await postProof({
        payload: result.finalPayload,
        action: 'test-action',
      });

      if (response?.verifyRes?.success) {
        setWorldIdVerified(true);
      } else {
        throw new Error('Verification rejected');
      }

      setState('success');
      setWorldIdVerified(true);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Verification error', error);
      }
      setState('error');
      setTimeout(() => {
        setState('idle');
      }, 2000);
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
