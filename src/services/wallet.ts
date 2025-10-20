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
  claimReady: boolean;
  nextClaimAt: number | null;
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

export interface WalletBalance {
  amount: number;
  symbol: string;
  fiatValue: number;
  claimReady: boolean;
  lastUpdated: number;
}

export type WalletActivityItemType = 'claim' | 'tip' | 'subscribe' | 'buy';

export interface WalletActivityItem {
  id: string;
  type: WalletActivityItemType;
  amount: number;
  timestamp: number;
  memo?: string;
}

const listeners = new Set<(state: WalletState) => void>();

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const STORAGE_KEY = 'wf:wallet-service-state';
const hasLocalStorage =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
let memoryStorage: string | null = null;

const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.info('[walletService]', ...args);
  }
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
  claimReady: true,
  nextClaimAt: null,
};

type PersistedWalletState = Pick<
  WalletState,
  'balance' | 'activities' | 'lastUpdated' | 'claimReady' | 'nextClaimAt'
>;

const persistState = (value: WalletState) => {
  const payload: PersistedWalletState = {
    balance: value.balance,
    activities: value.activities,
    lastUpdated: value.lastUpdated,
    claimReady: value.claimReady,
    nextClaimAt: value.nextClaimAt,
  };

  const serialized = JSON.stringify(payload);

  if (hasLocalStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      devLog('Failed to persist wallet state', error);
    }
    return;
  }

  memoryStorage = serialized;
};

const loadPersistedState = (): PersistedWalletState | null => {
  try {
    const raw = hasLocalStorage
      ? window.localStorage.getItem(STORAGE_KEY)
      : memoryStorage;

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedWalletState;
    return {
      ...parsed,
      activities: parsed.activities?.map((activity) => ({ ...activity })) ?? [],
    };
  } catch (error) {
    devLog('Failed to load persisted wallet state', error);
    return null;
  }
};

const mergeState = (
  fallback: WalletState,
  persisted: PersistedWalletState | null,
): WalletState => {
  if (!persisted) {
    return fallback;
  }

  return {
    ...fallback,
    ...persisted,
    balance: persisted.balance ?? fallback.balance,
    activities: persisted.activities ?? fallback.activities,
    claimReady:
      typeof persisted.claimReady === 'boolean'
        ? persisted.claimReady
        : fallback.claimReady,
    nextClaimAt:
      typeof persisted.nextClaimAt === 'number'
        ? persisted.nextClaimAt
        : null,
    lastUpdated: persisted.lastUpdated ?? fallback.lastUpdated,
  };
};

const persistedSnapshot = loadPersistedState();

let state: WalletState = mergeState(initialState, persistedSnapshot);

persistState(state);

const cloneState = (value: WalletState): WalletState => ({
  balance: { ...value.balance },
  activities: value.activities.map((activity) => ({ ...activity })),
  lastUpdated: value.lastUpdated,
  claimReady: value.claimReady,
  nextClaimAt: value.nextClaimAt,
});

const notify = () => {
  listeners.forEach((listener) => listener(cloneState(state)));
};

const setState = (updater: (previous: WalletState) => WalletState) => {
  state = updater(state);
  persistState(state);
  devLog('State updated', {
    balance: state.balance,
    claimReady: state.claimReady,
    activityCount: state.activities.length,
  });
  notify();
  return state;
};

const applyActivity = (
  activity: WalletActivityInput,
  extraState?: Partial<Pick<WalletState, 'claimReady' | 'nextClaimAt'>>,
): WalletActivity => {
  const delta = activity.direction === 'out' ? -activity.amount : activity.amount;
  const timestamp = activity.timestamp ?? Date.now();
  const entry: WalletActivity = {
    id: activity.reference ?? generateId(),
    description: activity.description ?? activity.memo ?? 'Wallet activity',
    ...activity,
    timestamp,
  };

  setState((current) => {
    const nextBalance = {
      ...current.balance,
      wldy: Math.max(0, parseFloat((current.balance.wldy + delta).toFixed(4))),
    };

    const nextActivities = [entry, ...current.activities].sort(
      (a, b) => b.timestamp - a.timestamp,
    );

    return {
      ...current,
      balance: nextBalance,
      activities: nextActivities,
      lastUpdated: timestamp,
      ...extraState,
    };
  });

  devLog('Recorded wallet activity', entry);

  return entry;
};

const CLAIM_INTERVAL_MS = 1000 * 60 * 60 * 24;

const ensureClaimState = () => {
  if (state.claimReady) {
    return;
  }

  if (state.nextClaimAt && Date.now() < state.nextClaimAt) {
    return;
  }

  setState((current) => ({
    ...current,
    claimReady: true,
    nextClaimAt: null,
  }));

  devLog('Daily claim is ready again');
};

export const walletService = {
  subscribe(listener: (snapshot: WalletState) => void) {
    listeners.add(listener);
    ensureClaimState();
    listener(cloneState(state));
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => {
    ensureClaimState();
    return cloneState(state);
  },
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

const activityTypeMap: Record<WalletActivityType, WalletActivityItemType> = {
  daily_claim: 'claim',
  subscription: 'subscribe',
  tip: 'tip',
  referral: 'claim',
  unlock: 'buy',
  buy_wfans: 'buy',
  other: 'buy',
};

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const toWalletBalance = (snapshot: WalletState): WalletBalance => {
  const amount = Number(snapshot.balance.wldy.toFixed(2));
  const fiatValue = Number(
    (snapshot.balance.wldy * snapshot.balance.usdRate).toFixed(2),
  );

  return {
    amount,
    symbol: 'WFANS',
    fiatValue,
    claimReady: snapshot.claimReady,
    lastUpdated: snapshot.lastUpdated,
  };
};

const toWalletActivityItem = (
  activity: WalletActivity,
): WalletActivityItem | null => {
  const mappedType = activityTypeMap[activity.type];

  if (!mappedType) {
    return null;
  }

  const signedAmount =
    activity.direction === 'out' ? -Math.abs(activity.amount) : activity.amount;

  return {
    id: activity.id,
    type: mappedType,
    amount: Number(signedAmount.toFixed(2)),
    timestamp: activity.timestamp,
    memo: activity.memo ?? activity.description,
  };
};

export const getBalance = async (): Promise<WalletBalance> => {
  ensureClaimState();
  await delay();
  const snapshot = walletService.getSnapshot();
  return toWalletBalance(snapshot);
};

export const getActivity = async (): Promise<WalletActivityItem[]> => {
  ensureClaimState();
  await delay();
  const snapshot = walletService.getSnapshot();

  return snapshot.activities
    .map(toWalletActivityItem)
    .filter((item): item is WalletActivityItem => item !== null)
    .slice(0, 20);
};

const DAILY_CLAIM_AMOUNT = 25;

export const claimDaily = async (): Promise<{
  success: boolean;
  amount: number;
}> => {
  ensureClaimState();

  if (!state.claimReady) {
    devLog('Daily claim attempted while unavailable');
    return { success: false, amount: 0 };
  }

  await delay(300);

  applyActivity(
    {
      type: 'daily_claim',
      amount: DAILY_CLAIM_AMOUNT,
      direction: 'in',
      memo: 'claim:daily',
      description: 'Daily claim bonus',
    },
    {
      claimReady: false,
      nextClaimAt: Date.now() + CLAIM_INTERVAL_MS,
    },
  );

  return { success: true, amount: DAILY_CLAIM_AMOUNT };
};

const WFANS_PURCHASE_AMOUNT = 100;

export const buyWFANS = async (): Promise<{ success: boolean }> => {
  await delay(300);

  applyActivity({
    type: 'buy_wfans',
    amount: WFANS_PURCHASE_AMOUNT,
    direction: 'in',
    memo: 'buy:wfans',
    description: 'WFANS purchase',
  });

  return { success: true };
};
