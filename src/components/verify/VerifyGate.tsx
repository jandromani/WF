'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { VerificationLevel } from '@worldcoin/minikit-js';
import { useState } from 'react';

import { verify } from '@/lib/minikit';
import { postProof } from '@/lib/worldid';

export const VerifyGate = () => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [whichVerification, setWhichVerification] = useState<VerificationLevel>(
    VerificationLevel.Device,
  );

  const setWorldIdVerified = useAuthStore((state) => state.setWorldIdVerified);

  const onClickVerify = async (verificationLevel: VerificationLevel) => {
    setButtonState('pending');
    setWhichVerification(verificationLevel);

    try {
      const result = await verify({
        action: 'test-action',
        verification_level: verificationLevel,
      });

      const response = await postProof({
        payload: result.finalPayload,
        action: 'test-action',
      });

      if (response?.verifyRes?.success) {
        setButtonState('success');
      } else {
        throw new Error('Verification rejected');
      }
    } catch (error) {
      console.error('Verification error', error);
      setButtonState('failed');
      setTimeout(() => {
        setButtonState(undefined);
      }, 2000);
    }
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Verify</p>
      <LiveFeedback
        label={{
          failed: 'Failed to verify',
          pending: 'Verifying',
          success: 'Verified',
        }}
        state={
          whichVerification === VerificationLevel.Device ? buttonState : undefined
        }
        className="w-full"
      >
        <Button
          onClick={() => onClickVerify(VerificationLevel.Device)}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="tertiary"
          className="w-full"
          data-testid="verify-device"
        >
          Verify (Device)
        </Button>
      </LiveFeedback>
      <LiveFeedback
        label={{
          failed: 'Failed to verify',
          pending: 'Verifying',
          success: 'Verified',
        }}
        state={
          whichVerification === VerificationLevel.Orb ? buttonState : undefined
        }
        className="w-full"
      >
        <Button
          onClick={() => onClickVerify(VerificationLevel.Orb)}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
          data-testid="verify-orb"
        >
          Verify (Orb)
        </Button>
      </LiveFeedback>
    </div>
  );
};
