'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { Tokens, tokenToDecimals } from '@worldcoin/minikit-js';
import { useState } from 'react';

import { getUserWalletByUsername, pay } from '@/lib/minikit';

export const Pay = () => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [activeAction, setActiveAction] = useState<'subscription' | 'tip' | null>(
    null,
  );
  const applyMovement = useWalletStore((state) => state.applyMovement);

  const executePayCommand = async (amount: number, description: string) => {
    try {
      const alexUser = await MiniKit.getUserByUsername('alex');
      const res = await fetch('/api/initiate-payment', {
        method: 'POST',
      });
      const { id } = await res.json();

      if (MiniKit.commandsAsync.pay) {
        const result = await MiniKit.commandsAsync.pay({
          reference: id,
          to: alexUser.walletAddress ??
            '0x0000000000000000000000000000000000000000',
          tokens: [
            {
              symbol: Tokens.WLD,
              token_amount: tokenToDecimals(amount, Tokens.WLD).toString(),
            },
          ],
          description,
        });

        if (result.finalPayload.status !== 'success') {
          throw new Error('Payment was rejected');
        }
      }
    } catch (error) {
      console.warn('MiniKit pay command unavailable', error);
    }
  };

  const runAction = async (
    kind: 'subscription' | 'tip',
    amount: number,
    label: string,
  ) => {
    if (buttonState === 'pending') {
      return;
    }

  const onClickPay = async () => {
    setButtonState('pending');
    setActiveAction(kind);

    try {
      const response = await fetch('/api/initiate-payment', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Unable to initialise payment');
      }
      const { id } = (await response.json()) as { id: string };

      const address = await getUserWalletByUsername('alex');

      const result = await pay({
        reference: id,
        to: address ?? '0x0000000000000000000000000000000000000000',
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(0.5, Tokens.WLD).toString(),
          },
          {
            symbol: Tokens.USDC,
            token_amount: tokenToDecimals(0.1, Tokens.USDC).toString(),
          },
        ],
        description: 'Test example payment for minikit',
      });

      if (result.finalPayload.status === 'success') {
        setButtonState('success');
      } else {
        throw new Error('Payment rejected');
      }
    } catch (error) {
      console.error('Payment error', error);
      setButtonState('failed');
      setTimeout(() => {
        setButtonState(undefined);
      }, 3000);
      return;
    }
  };

  return (
    <div className="grid w-full gap-4" data-testid="pay-actions">
      <p className="text-lg font-semibold">Pagos</p>
      <LiveFeedback
        label={{
          failed: 'Pago fallido',
          pending: 'Procesando pago',
          success: 'Pago exitoso',
        }}
        state={activeAction === 'subscription' ? buttonState : undefined}
        className="w-full"
      >
        <Button
          onClick={() => runAction('subscription', 1.5, 'Suscripción mensual')}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
          data-testid="subscribe-action"
        >
          Suscribirse
        </Button>
      </LiveFeedback>
      <LiveFeedback
        label={{
          failed: 'Pago fallido',
          pending: 'Procesando pago',
          success: 'Pago exitoso',
        }}
        state={activeAction === 'tip' ? buttonState : undefined}
        className="w-full"
      >
        <Button
          onClick={() => runAction('tip', 0.4, 'Tip rápido')}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="secondary"
          className="w-full"
          data-testid="tip-action"
        >
          Enviar propina
        </Button>
      </LiveFeedback>
    </div>
  );
};
