'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { Tokens, tokenToDecimals } from '@worldcoin/minikit-js';
import { useState } from 'react';

import { getUserWalletByUsername, pay } from '@/lib/minikit';

export const Pay = () => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  const onClickPay = async () => {
    setButtonState('pending');

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
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Pay</p>
      <LiveFeedback
        label={{
          failed: 'Payment failed',
          pending: 'Payment pending',
          success: 'Payment successful',
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={onClickPay}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Pay
        </Button>
      </LiveFeedback>
    </div>
  );
};
