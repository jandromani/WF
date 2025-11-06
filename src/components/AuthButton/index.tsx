'use client';

import { LOGIN_ACTION_ID, SESSION_LIMITS, clampSessionDuration } from '@/auth/config';
import { walletAuth } from '@/auth/wallet';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { IDKitWidget, type ISuccessResult } from '@worldcoin/idkit';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

type FeedbackState = 'idle' | 'pending' | 'success' | 'failed';

const presetDurations = [15, 30, 60, 120, 180, 240];
const durationOptions = Array.from(
  new Set(
    presetDurations
      .map((value) => clampSessionDuration(value))
      .concat([SESSION_LIMITS.min, SESSION_LIMITS.max]),
  ),
)
  .filter((value) => value >= SESSION_LIMITS.min && value <= SESSION_LIMITS.max)
  .sort((a, b) => a - b);

const describeDuration = (minutes: number) => {
  if (minutes <= 30) {
    return {
      tone: 'warning',
      message: 'Sesión corta recomendada para dispositivos compartidos.',
    } as const;
  }

  if (minutes <= 120) {
    return {
      tone: 'info',
      message: 'Equilibrio entre seguridad y comodidad para revisar la app.',
    } as const;
  }

  return {
    tone: 'danger',
    message: 'Sesiones largas: asegúrate de cerrar sesión en equipos ajenos.',
  } as const;
};

const toneClasses: Record<string, string> = {
  info: 'text-sky-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  success: 'text-emerald-600',
};

const toLiveFeedbackState = (state: FeedbackState): 'pending' | 'failed' | 'success' | undefined => {
  if (state === 'pending') return 'pending';
  if (state === 'failed') return 'failed';
  if (state === 'success') return 'success';
  return undefined;
};

const extractWalletFromResult = (result: ISuccessResult) => {
  const candidate =
    (result as unknown as { wallet_address?: string }).wallet_address ??
    (result as unknown as { wallet?: string }).wallet ??
    null;

  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
};

export const AuthButton = () => {
  const appId = process.env.NEXT_PUBLIC_APP_ID as `app_${string}` | undefined;
  const [duration, setDuration] = useState(clampSessionDuration(60));
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedOption = useMemo(() => {
    const meta = describeDuration(duration);
    return {
      value: duration,
      label: `${duration} min`,
      ...meta,
    };
  }, [duration]);

  if (!appId) {
    return (
      <div className="space-y-4 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Configura tus credenciales</p>
        <p>
          Añade <code className="rounded bg-white px-1">NEXT_PUBLIC_APP_ID</code> en tu{' '}
          <code className="rounded bg-white px-1">.env.local</code> para habilitar el inicio de sesión con World ID.
        </p>
      </div>
    );
  }

  const handleSuccess = async (result: ISuccessResult) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setFeedbackState('pending');

    try {
      const walletAddress = extractWalletFromResult(result);
      await walletAuth({
        result,
        sessionDurationMinutes: duration,
        walletAddress,
      });
      setFeedbackState('success');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('World ID login failed', error);
      }
      setFeedbackState('failed');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No pudimos iniciar sesión. Intenta nuevamente.',
      );
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Tiempo de sesión</p>
          <span className="text-xs text-slate-500">Entre {SESSION_LIMITS.min} y {SESSION_LIMITS.max} min</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {durationOptions.map((value) => {
            const isActive = value === duration;
            return (
              <button
                key={value}
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setDuration(clampSessionDuration(value));
                  setFeedbackState('idle');
                }}
                className={clsx(
                  'rounded-full border px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-black bg-black text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
                  isProcessing ? 'opacity-60' : undefined,
                )}
              >
                {value} min
              </button>
            );
          })}
        </div>
        <p className={clsx('text-xs', toneClasses[selectedOption.tone])}>{selectedOption.message}</p>
      </div>

      <IDKitWidget
        app_id={appId}
        action={LOGIN_ACTION_ID}
        autoClose
        onSuccess={handleSuccess}
        onError={(error) => {
          if (process.env.NODE_ENV !== 'production') {
            console.error('IDKit error', error);
          }
          setFeedbackState('failed');
          setErrorMessage('No pudimos completar la verificación. Intenta nuevamente.');
        }}
      >
        {({ open }) => (
          <LiveFeedback
            label={{
              failed: 'Error al iniciar sesión',
              pending: 'Creando sesión segura',
              success: 'Sesión creada',
            }}
            state={toLiveFeedbackState(feedbackState)}
          >
            <Button
              onClick={() => {
                if (isProcessing) {
                  return;
                }
                setErrorMessage(null);
                setFeedbackState('pending');
                open();
              }}
              disabled={isProcessing}
              size="lg"
              variant="primary"
              className="w-full"
            >
              Iniciar sesión con World ID
            </Button>
          </LiveFeedback>
        )}
      </IDKitWidget>

      <p className="text-xs text-slate-500">
        La sesión se cerrará automáticamente al expirar o al cerrar manualmente la sesión. Podrás volver a iniciar sesión
        cuando lo necesites.
      </p>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
};
