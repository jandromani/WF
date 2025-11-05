'use client';
import { setLocalizationConfig } from '@worldcoin/idkit';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect } from 'react';

import { StoreHydrator } from '@/providers/StoreHydrator';

const ErudaProvider = dynamic(
  () => import('@/providers/Eruda').then((c) => c.ErudaProvider),
  { ssr: false },
);

// Define props for ClientProviders
interface ClientProvidersProps {
  children: ReactNode;
  session: Session | null; // Use the appropriate type for session from next-auth
}

/**
 * ClientProvider wraps the app with essential context providers.
 *
 * - ErudaProvider:
 *     - Should be used only in development.
 *     - Enables an in-browser console for logging and debugging.
 *
 * - IDKitProvider:
 *     - Configures the IDKit widget to use the default locale.
 *
 * This component ensures both providers are available to all child components.
 */
function IDKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    setLocalizationConfig({ language: 'es' });
  }, []);

  return <>{children}</>;
}

export default function ClientProviders({
  children,
  session,
}: ClientProvidersProps) {
  return (
    <ErudaProvider>
      <IDKitProvider>
        <SessionProvider session={session}>
          <StoreHydrator />
          {children}
        </SessionProvider>
      </IDKitProvider>
    </ErudaProvider>
  );
}
