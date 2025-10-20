'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { useEffect, useState } from 'react';

import { notify } from '@/lib/minikit';
import { useWalletStore } from '@/store/useWalletStore';

const CLAIM_AMOUNT = 1.25;

export const ClaimCard = () => {
  const claimReady = useWalletStore((state) => state.claimReady);
  const completeClaim = useWalletStore((state) => state.completeClaim);
  const [isClaiming, setIsClaiming] = useState(false);
  const [notifiedReady, setNotifiedReady] = useState(false);

  useEffect(() => {
    if (claimReady && !notifiedReady) {
      void notify({
        title: 'Claim listo',
        body: 'Tu recompensa está esperando por ti.',
      });
      setNotifiedReady(true);
    }
  }, [claimReady, notifiedReady]);

  const onClaim = async () => {
    if (!claimReady || isClaiming) {
      return;
    }

    setIsClaiming(true);
    try {
      await completeClaim(CLAIM_AMOUNT);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div
      className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid="claim-card"
    >
      <div className="mb-3">
        <p className="text-base font-semibold">Reclamaciones pendientes</p>
        <p className="text-sm text-slate-500">
          Obtén tus recompensas acumuladas en segundos.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-slate-500">Disponible</span>
          <span className="text-2xl font-semibold">{CLAIM_AMOUNT.toFixed(2)} WLD</span>
        </div>
        <Button
          onClick={onClaim}
          disabled={!claimReady || isClaiming}
          data-testid="claim-action"
        >
          {isClaiming ? 'Reclamando…' : 'Reclamar'}
        </Button>
        {!claimReady && (
          <p className="text-xs text-slate-500">
            El claim se completó correctamente.
          </p>
        )}
      </div>
    </div>
  );
};
