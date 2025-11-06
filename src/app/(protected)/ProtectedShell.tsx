'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, startTransition, useEffect, useMemo, useState } from 'react';
import { Bank, Bell, Home, Message, Settings } from 'iconoir-react';

import { Navigation } from '@/components/Navigation';
import { DashboardSidebar } from '@/components/home/DashboardSidebar';
import { NotificationCenter } from '@/components/NotificationCenter';
import { VerifyGate } from '@/components/verify/VerifyGate';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { useWallet } from '@/lib/hooks/useWallet';
import { isWorldApp } from '@/lib/minikit';
import { env } from '@/lib/env';
import { useAuthStore } from '@/lib/stores/auth';

interface ProtectedShellProps {
  children: ReactNode;
}

export function ProtectedShell({ children }: ProtectedShellProps) {
  const [worldAppInstalled, setWorldAppInstalled] = useState<boolean | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useAuthStore((state) => state.worldIdVerified);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dmsOpen, setDmsOpen] = useState(false);
  const pathname = usePathname();
  const { balance } = useWallet();

  const navItems = useMemo(
    () => [
      { href: '/home', label: 'Inicio', icon: <Home width={18} /> },
      { href: '/feed', label: 'Feed', icon: <Message width={18} /> },
      { href: '/wallet', label: 'Wallet', icon: <Bank width={18} /> },
      { href: '/settings', label: 'Ajustes', icon: <Settings width={18} /> },
    ],
    [],
  );

  const dexUrl = env.contracts.token
    ? `https://dexscreener.com/worldchain/${env.contracts.token}`
    : 'https://dexscreener.com/worldchain';

  useEffect(() => {
    startTransition(() => {
      setHydrated(true);
    });
    useAuthStore.persist?.rehydrate?.();
  }, []);

  useEffect(() => {
    try {
      const installed = isWorldApp();
      startTransition(() => {
        setWorldAppInstalled(installed);
      });
    } catch {
      startTransition(() => {
        setWorldAppInstalled(false);
      });
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
    <div className="flex min-h-dvh bg-slate-950 text-white">
      <aside className="relative hidden min-h-dvh w-64 flex-col border-r border-white/5 bg-slate-900/80 p-6 lg:flex">
        <Link href="/home" className="mb-8 inline-flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-base font-bold">
            WF
          </span>
          {env.app.name}
        </Link>
        <nav className="space-y-2 text-sm">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-4 py-3 transition',
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/70 hover:bg-white/10',
                )}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 rounded-2xl bg-white/5 p-4 text-sm">
          <p className="text-xs uppercase tracking-wide text-white/50">Balance WFANS</p>
          <p className="text-2xl font-semibold">{balance.toLocaleString('es-ES')}</p>
          <a
            href={dexUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            Ver WFANS en Dexscreener
          </a>
        </div>
      </aside>
      <div className="flex min-h-dvh flex-1 flex-col bg-slate-100">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-slate-500">World Feed</span>
              <span className="text-lg font-semibold text-slate-900">
                {navItems.find((item) => pathname?.startsWith(item.href))?.label ?? 'Panel'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNotificationsOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300"
                aria-label="Notificaciones"
              >
                <Bell width={18} />
              </button>
              <button
                type="button"
                onClick={() => setDmsOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300"
                aria-label="Mensajes"
              >
                <Message width={18} />
              </button>
              <WalletConnectButton />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col xl:flex-row">
          <main className="flex-1 overflow-y-auto px-4 pb-28 pt-6 lg:px-8">
            <VerifyGate className="mb-4" />
            <div className="pb-10">{children}</div>
          </main>
          <aside className="hidden w-full max-w-xs border-l border-slate-200 bg-white/70 px-5 py-6 xl:block">
            <DashboardSidebar />
          </aside>
        </div>
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 px-4 pb-4 pt-2 shadow-[0_-8px_16px_rgba(15,23,42,0.1)] lg:hidden">
          <Navigation />
        </footer>
      </div>

      {notificationsOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Notificaciones</h2>
              <button className="text-sm text-slate-500" onClick={() => setNotificationsOpen(false)}>
                Cerrar
              </button>
            </div>
            <NotificationCenter />
          </div>
        </div>
      ) : null}

      {dmsOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Mensajes Directos</h2>
              <button className="text-sm text-slate-500" onClick={() => setDmsOpen(false)}>
                Cerrar
              </button>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">@alice</p>
                <p>Gracias por el tip 🙌 Estoy preparando contenido exclusivo.</p>
              </li>
              <li className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">@bob</p>
                <p>Nuevo AMA este viernes. ¿Te apuntas?</p>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
