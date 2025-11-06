'use client';
import { MiniKitProvider as BaseMiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect } from 'react';

import { StoreHydrator } from '@/providers/StoreHydrator';
import { WorldChainWalletProvider } from '@/providers/WorldChainWalletProvider';
import { env } from '@/lib/env';

const MiniKitProvider = env.app.enableWldy
  ? BaseMiniKitProvider
  : ({ children }: { children: ReactNode }) => <>{children}</>;

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
export default function ClientProviders({ children, session }: ClientProvidersProps) {
  const Content = (
    <SessionProvider session={session}>
      <StoreHydrator />
      <WorldChainWalletProvider>{children}</WorldChainWalletProvider>
    </SessionProvider>
  );

  return (
    <ErudaProvider>
      {MiniKitProvider ? <MiniKitProvider>{Content}</MiniKitProvider> : Content}
    </ErudaProvider>
  );
}
