'use client';

type WalletActivityDirection = 'in' | 'out';

export type WalletActivityType =
  | 'daily_claim'
  | 'subscription'
  | 'tip'
  | 'referral'
  | 'unlock'
  | 'buy_wfans'
  | 'other';

export interface WalletActivity {
  id: string;
  type: WalletActivityType;
  amount: number;
  direction: WalletActivityDirection;
  memo?: string;
  reference?: string;
  counterparty?: string;
  timestamp: number;
  description: string;
}

export interface WalletBalanceState {
  wldy: number;
  usdRate: number;
}

export interface WalletState {
  balance: WalletBalanceState;
  activities: WalletActivity[];
  lastUpdated: number;
}

export interface WalletActivityInput {
  type: WalletActivityType;
  amount: number;
  direction: WalletActivityDirection;
  memo?: string;
  reference?: string;
  counterparty?: string;
  description?: string;
  timestamp?: number;
}

const listeners = new Set<(state: WalletState) => void>();

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const initialState: WalletState = {
  balance: {
    wldy: 1280,
    usdRate: 1.25,
  },
  activities: [
    {
      id: generateId(),
      type: 'daily_claim',
      amount: 25,
      direction: 'in',
      memo: 'claim:daily',
      description: 'Daily claim bonus',
      timestamp: Date.now() - 1000 * 60 * 60 * 6,
    },
    {
      id: generateId(),
      type: 'referral',
      amount: 50,
      direction: 'in',
      memo: 'referral:jenna',
      description: 'Referral reward from @jenna',
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
    },
  ],
  lastUpdated: Date.now(),
};

let state: WalletState = initialState;

const cloneState = (value: WalletState): WalletState => ({
  balance: { ...value.balance },
  activities: [...value.activities],
  lastUpdated: value.lastUpdated,
});

const notify = () => {
  listeners.forEach((listener) => listener(cloneState(state)));
};

const applyActivity = (activity: WalletActivityInput): WalletActivity => {
  const delta = activity.direction === 'out' ? -activity.amount : activity.amount;
  const timestamp = activity.timestamp ?? Date.now();
  const entry: WalletActivity = {
    id: activity.reference ?? generateId(),
    description: activity.description ?? activity.memo ?? 'Wallet activity',
    ...activity,
    timestamp,
  };

  state = {
    balance: {
      ...state.balance,
      wldy: Math.max(0, parseFloat((state.balance.wldy + delta).toFixed(4))),
    },
    activities: [entry, ...state.activities].sort(
      (a, b) => b.timestamp - a.timestamp,
    ),
    lastUpdated: timestamp,
  };

  notify();
  return entry;
};

export const walletService = {
  subscribe(listener: (snapshot: WalletState) => void) {
    listeners.add(listener);
    listener(cloneState(state));
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => cloneState(state),
  async recordActivity(activity: WalletActivityInput) {
    return applyActivity(activity);
  },
  async adjustBalance(delta: number, memo = 'balance:adjustment') {
    const description = delta >= 0 ? 'Balance adjustment' : 'Balance deduction';
    return applyActivity({
      type: 'other',
      amount: Math.abs(delta),
      direction: delta >= 0 ? 'in' : 'out',
      memo,
      description,
    });
  },
};

export type WalletService = typeof walletService;
