'use client';

import { addresses } from '@/lib/worldfans-contracts';
import { walletService } from '@/services/wallet';
import {
  MiniKit,
  Tokens,
  tokenToDecimals,
} from '@worldcoin/minikit-js';

export interface PayOptions {
  amount: number;
  memo: string;
  description?: string;
  to?: `0x${string}` | string;
}

const memoTypeMap: Record<
  string,
  {
    type: Parameters<typeof walletService.recordActivity>[0]['type'];
    label: (amount: number, counterparty?: string) => string;
  }
> = {
  sub: {
    type: 'subscription',
    label: (amount, counterparty) =>
      `Subscription · 95% creator / 5% burn (${counterparty ?? 'creator'})`,
  },
  tip: {
    type: 'tip',
    label: (amount, counterparty) =>
      `Tip sent${counterparty ? ` to ${counterparty}` : ''}`,
  },
  unlock: {
    type: 'unlock',
    label: () => 'Premium content unlock · 95/5 split',
  },
  buy_wfans: {
    type: 'buy_wfans',
    label: () => 'Buy WFANS package',
  },
};

const parseMemo = (memo: string, amount: number) => {
  const [rawType, payload] = memo.split(':');
  if (!rawType) {
    return {
      activityType: 'other' as const,
      description: memo,
      counterparty: undefined,
    };
  }

  if (rawType === 'buy_wfans') {
    return {
      activityType: memoTypeMap.buy_wfans.type,
      description: memoTypeMap.buy_wfans.label(amount),
      counterparty: undefined,
    };
  }

  const match = memoTypeMap[rawType];
  return {
    activityType: match?.type ?? ('other' as const),
    description: match?.label(amount, payload) ?? memo,
    counterparty: payload,
  };
};

export async function pay({ amount, memo, description, to }: PayOptions) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  const { activityType, description: fallbackDescription, counterparty } =
    parseMemo(memo, amount);

  const reference =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const recipient = to ?? addresses.pay;

  const result = await MiniKit.commandsAsync.pay({
    reference,
    to: recipient,
    tokens: [
      {
        symbol: Tokens.WLD,
        token_amount: tokenToDecimals(amount, Tokens.WLD).toString(),
      },
    ],
    description: description ?? fallbackDescription,
  });

  const status = result.finalPayload?.status;

  if (status !== 'success') {
    throw new Error('Payment failed');
  }

  await walletService.recordActivity({
    type: activityType,
    amount,
    direction: 'out',
    memo,
    reference,
    counterparty,
    description: description ?? fallbackDescription,
  });

  return result.finalPayload;
}
