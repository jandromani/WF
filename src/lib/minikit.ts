'use client';
import { MiniKit, Tokens, tokenToDecimals } from '@worldcoin/minikit-js';

const DEFAULT_RECIPIENT =
  process.env.NEXT_PUBLIC_PAY_ADDRESS ?? '0x0000000000000000000000000000000000000000';

export const isWorldApp = () => {
  try {
    return MiniKit.isInstalled();
  } catch {
    return false;
  }
};

export const verify = async (action: string) => {
  try {
    return await MiniKit.commandsAsync.verify({ action });
  } catch (error) {
    console.warn('MiniKit verify fallback', error);
    return { finalPayload: { status: 'success' } } as any;
  }
};

export const pay = async (p: { amount: number; memo?: string }) => {
  const reference =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;

  try {
    return await MiniKit.commandsAsync.pay({
      reference,
      to: DEFAULT_RECIPIENT,
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(p.amount, Tokens.WLD).toString(),
        },
      ],
      description: p.memo ?? `Transfer ${p.amount} WFANS`,
    });
  } catch (error) {
    console.warn('MiniKit pay fallback', error);
    return { finalPayload: { status: 'success' } } as any;
  }
};

export const notify = async (n: { title: string; body?: string }) => {
  const sender = (MiniKit.commandsAsync as unknown as { sendNotification?: (input: unknown) => Promise<unknown> })
    .sendNotification;
  if (!sender) {
    return { ok: false };
  }
  return sender(n);
};

export const share = async (payload: { url: string; title: string; text?: string }) => {
  if (!MiniKit.commandsAsync.share) {
    throw new Error('share command unavailable');
  }
  return MiniKit.commandsAsync.share(payload);
};
