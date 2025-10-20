'use client';

import { ShieldAlert } from 'iconoir-react';

import { useAuthStore } from '@/store/useAuthStore';

export const VerificationGate = () => {
  const worldIdVerified = useAuthStore((state) => state.worldIdVerified);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated || worldIdVerified) {
    return null;
  }

  return (
    <div
      data-testid="verification-gate"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/95 p-6 text-center shadow-lg"
    >
      <ShieldAlert className="h-12 w-12 text-blue-600" />
      <div className="grid gap-1">
        <p className="text-lg font-semibold">Verificación requerida</p>
        <p className="text-sm text-slate-600">
          Completa la verificación World ID para acceder al contenido de la mini-app.
        </p>
      </div>
    </div>
  );
};
