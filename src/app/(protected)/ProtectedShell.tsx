'use client';

import { ReactNode, useEffect, useState } from 'react';

import { Navigation } from '@/components/Navigation';
import { Page } from '@/components/PageLayout';
import { SessionExpiryNotice } from '@/components/SessionExpiryNotice';
import { VerifyGate } from '@/components/verify/VerifyGate';
import { useAuthStore } from '@/lib/stores/auth';
import { isWorldApp } from '@/lib/minikit';

interface ProtectedShellProps {
  children: ReactNode;
}

export function ProtectedShell({ children }: ProtectedShellProps) {
  const [worldAppInstalled, setWorldAppInstalled] = useState<boolean | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useAuthStore((state) => state.worldIdVerified);

  useEffect(() => {
    setHydrated(true);
    useAuthStore.persist?.rehydrate?.();
  }, []);

  useEffect(() => {
    try {
      const installed = isWorldApp();
      setWorldAppInstalled(installed);
    } catch {
      setWorldAppInstalled(false);
    }
  }, []);

  if (!hydrated || worldAppInstalled === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-gray-500">
        Cargando Mini App...
      </div>
    );
  }

  if (!worldAppInstalled) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Ábreme en World App</h1>
        <p className="text-sm text-gray-600">
          Esta experiencia está diseñada para ejecutarse dentro de World App. Usa el código QR o el enlace
          directo para continuar.
        </p>
      </div>
    );
  }

  return (
    <Page>
      <Page.Main className="bg-gray-50 pb-28">
        <div className="px-4 pt-4">
          <SessionExpiryNotice />
        </div>
        <VerifyGate className="mb-4" />
        <div className="px-4 pb-6">{children}</div>
      </Page.Main>
      <Page.Footer className="fixed bottom-0 left-0 w-full px-0">
        <Navigation />
      </Page.Footer>
    </Page>
  );
}
