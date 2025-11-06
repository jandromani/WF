'use client';

import clsx from 'clsx';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

const WARNING_THRESHOLD_MINUTES = 15;
const CRITICAL_THRESHOLD_MINUTES = 5;

const severityStyles = {
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  critical: 'border-red-200 bg-red-50 text-red-800',
} as const;

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

export const SessionExpiryNotice = () => {
  const { data: session, status } = useSession();
  const [now, setNow] = useState(() => Date.now());

  const expiryTime = useMemo(
    () => (session?.expires ? new Date(session.expires).getTime() : null),
    [session?.expires],
  );
  const shouldTrack = status === 'authenticated' && typeof expiryTime === 'number';

  useEffect(() => {
    if (!shouldTrack || typeof expiryTime !== 'number') {
      return;
    }

    const tick = () => setNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [shouldTrack, expiryTime]);

  useEffect(() => {
    if (!shouldTrack || typeof expiryTime !== 'number') {
      return;
    }

    if (expiryTime <= now) {
      void signOut({ callbackUrl: '/landing' });
    }
  }, [shouldTrack, expiryTime, now]);

  const minutesLeft = useMemo(() => {
    if (!shouldTrack || typeof expiryTime !== 'number') {
      return null;
    }

    return Math.max(0, Math.ceil((expiryTime - now) / 60_000));
  }, [expiryTime, now, shouldTrack]);

  if (!shouldTrack || minutesLeft === null) {
    return null;
  }

  const severity =
    minutesLeft <= CRITICAL_THRESHOLD_MINUTES
      ? 'critical'
      : minutesLeft <= WARNING_THRESHOLD_MINUTES
        ? 'warning'
        : 'info';

  const expiryDate = new Date(expiryTime);
  const formattedExpiry = formatTime(expiryDate);
  const totalMinutes = session.sessionDurationMinutes;

  return (
    <div
      className={clsx(
        'rounded-3xl border px-4 py-3 text-xs font-medium shadow-sm transition-colors',
        severityStyles[severity],
      )}
      role="status"
    >
      <div className="flex flex-col gap-1">
        <span>
          {minutesLeft > 0
            ? `Tu sesión expira en aproximadamente ${minutesLeft} min ( ${formattedExpiry} ).`
            : 'Tu sesión ha expirado y te redirigiremos al inicio.'}
        </span>
        <span className="text-[11px] opacity-80">
          Duración seleccionada: {totalMinutes} min · El cierre de sesión será automático para proteger tu cuenta.
        </span>
      </div>
    </div>
  );
};
