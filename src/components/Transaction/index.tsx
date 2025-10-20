'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useWaitForTransactionReceipt } from '@worldcoin/minikit-react';
import { useEffect, useMemo, useState } from 'react';

import { sendTransaction, getUserWalletByUsername } from '@/lib/minikit';
import { publicClient } from '@/lib/viem';
import { getContractConfig } from '@/lib/worldfans-contracts';

const APP_ID = process.env.NEXT_PUBLIC_APP_ID as `app_${string}` | undefined;

export const Transaction = () => {
  const { address: payContractAddress, abi: payAbi } = useMemo(
    () => getContractConfig('pay'),
    [],
  );
  const appConfig = useMemo(
    () => ({ app_id: (APP_ID ?? 'app_placeholder') as `app_${string}` }),
    [],
  );
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [whichButton, setWhichButton] = useState<'getToken' | 'usePermit2'>(
    'getToken',
  );

  const [transactionId, setTransactionId] = useState<string>('');

  const { isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt({
    client: publicClient,
    appConfig,
    transactionId,
  });

  useEffect(() => {
    if (!transactionId || isLoading) {
      return;
    }

    if (isSuccess) {
      setButtonState('success');
      setTimeout(() => setButtonState(undefined), 3000);
    } else if (isError) {
      console.error('Transaction failed:', error);
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 3000);
    }
  }, [error, isError, isLoading, isSuccess, transactionId]);

  const onClickGetToken = async () => {
    if (!APP_ID) {
      console.error('Missing NEXT_PUBLIC_APP_ID for transactions');
      return;
    }

    setTransactionId('');
    setWhichButton('getToken');
    setButtonState('pending');

    try {
      const { finalPayload } = await sendTransaction({
        transaction: [
          {
            address: payContractAddress,
            abi: payAbi,
            functionName: 'mintToken',
            args: [],
          },
        ],
      });

      if (finalPayload.status === 'success') {
        setTransactionId(finalPayload.transaction_id);
      } else {
        throw new Error('Transaction submission failed');
      }
    } catch (err) {
      console.error('Error sending transaction:', err);
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 3000);
    }
  };

  const onClickUsePermit2 = async () => {
    if (!APP_ID) {
      console.error('Missing NEXT_PUBLIC_APP_ID for transactions');
      return;
    }

    setTransactionId('');
    setWhichButton('usePermit2');
    setButtonState('pending');

    try {
      const recipient = await getUserWalletByUsername('alex');

      const permitTransfer = {
        permitted: {
          token: payContractAddress,
          amount: (0.5 * 10 ** 18).toString(),
        },
        nonce: Date.now().toString(),
        deadline: Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString(),
      } as const;

      const { finalPayload } = await sendTransaction({
        transaction: [
          {
            address: payContractAddress,
            abi: payAbi,
            functionName: 'signatureTransfer',
            args: [
              [
                [permitTransfer.permitted.token, permitTransfer.permitted.amount],
                permitTransfer.nonce,
                permitTransfer.deadline,
              ],
              [
                recipient ?? '0x0000000000000000000000000000000000000000',
                permitTransfer.permitted.amount,
              ],
              'PERMIT2_SIGNATURE_PLACEHOLDER_0',
            ],
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: payContractAddress,
          },
        ],
      });

      if (finalPayload.status === 'success') {
        setTransactionId(finalPayload.transaction_id);
      } else {
        throw new Error('Transaction submission failed');
      }
    } catch (err) {
      console.error('Error sending transaction:', err);
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 3000);
    }
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Transaction</p>
      <LiveFeedback
        label={{
          failed: 'Transaction failed',
          pending: 'Transaction pending',
          success: 'Transaction successful',
        }}
        state={whichButton === 'getToken' ? buttonState : undefined}
        className="w-full"
      >
        <Button
          onClick={onClickGetToken}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Get Token
        </Button>
      </LiveFeedback>
      <LiveFeedback
        label={{
          failed: 'Transaction failed',
          pending: 'Transaction pending',
          success: 'Transaction successful',
        }}
        state={whichButton === 'usePermit2' ? buttonState : undefined}
        className="w-full"
      >
        <Button
          onClick={onClickUsePermit2}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="tertiary"
          className="w-full"
        >
          Use Permit2
        </Button>
      </LiveFeedback>
    </div>
  );
};
