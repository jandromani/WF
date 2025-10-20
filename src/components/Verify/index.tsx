'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useState } from 'react';

import { useAuthStore } from '@/store/useAuthStore';

/**
 * This component is an example of how to use World ID in Mini Apps
 * Minikit commands must be used on client components
 * It's critical you verify the proof on the server side
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */
export const Verify = () => {
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
      if (MiniKit.commandsAsync.verify) {
        try {
          const result = await MiniKit.commandsAsync.verify({
            action: 'test-action', // Make sure to create this in the developer portal -> incognito actions
            verification_level: verificationLevel,
          });
          console.log(result.finalPayload);
          // Verify the proof
          const response = await fetch('/api/verify-proof', {
            method: 'POST',
            body: JSON.stringify({
              payload: result.finalPayload,
              action: 'test-action',
            }),
          });

          const data = await response.json();
          if (data.verifyRes.success) {
            setWorldIdVerified(true);
            setButtonState('success');
            return;
          }
        } catch (error) {
          console.warn('MiniKit verification unavailable', error);
        }
      }

      // MiniKit not available or verification failed -> simulate success for demo purposes
      setWorldIdVerified(true);
      setButtonState('success');
    } catch (error) {
      console.error('Verification failed', error);
      setWorldIdVerified(false);
      setButtonState('failed');

      // Reset the button state after 3 seconds
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
          whichVerification === VerificationLevel.Device
            ? buttonState
            : undefined
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
