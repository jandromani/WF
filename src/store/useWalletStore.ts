import { notify } from '@/lib/minikit';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type WalletActivity = {
  id: string;
  kind: 'claim' | 'tip' | 'subscription' | 'system';
  title: string;
  amount: number;
  createdAt: string;
};

type WalletState = {
  balance: number;
  activity: WalletActivity[];
  claimReady: boolean;
  hydrated: boolean;
  refresh: () => Promise<void>;
  completeClaim: (amount: number) => Promise<void>;
  recordActivity: (entry: WalletActivity) => void;
  applyMovement: (payload: {
    kind: WalletActivity['kind'];
    title: string;
    amount: number;
  }) => void;
  markHydrated: () => void;
  reset: () => void;
};

type WalletStorageState = Pick<WalletState, 'balance' | 'activity' | 'claimReady'>;

const storage =
  typeof window === 'undefined'
    ? undefined
    : createJSONStorage<WalletStorageState>(() => localStorage);

const initialState: WalletStorageState = {
  balance: 24.8,
  activity: [
    {
      id: 'activity-1',
      kind: 'system',
      title: 'Bienvenido a World Feed',
      amount: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  claimReady: true,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      ...initialState,
      hydrated: false,
      refresh: async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const nextBalance = Number((get().balance + 0.2).toFixed(2));
        set({ balance: nextBalance });
        get().recordActivity({
          id: `activity-${Date.now()}`,
          kind: 'system',
          title: 'Balance actualizado',
          amount: 0.2,
          createdAt: new Date().toISOString(),
        });
      },
      completeClaim: async (amount: number) => {
        if (!get().claimReady) {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
        set({
          claimReady: false,
          balance: Number((get().balance + amount).toFixed(2)),
        });
        get().recordActivity({
          id: `claim-${Date.now()}`,
          kind: 'claim',
          title: 'Recompensa reclamada',
          amount,
          createdAt: new Date().toISOString(),
        });
        await notify({
          title: 'Claim completado',
          body: 'Tus recompensas ya están en tu balance.',
        });
      },
      recordActivity: (entry) =>
        set({ activity: [entry, ...get().activity].slice(0, 20) }),
      applyMovement: ({ kind, title, amount }) =>
        set((state) => {
          const movement: WalletActivity = {
            id: `${kind}-${Date.now()}`,
            kind,
            title,
            amount,
            createdAt: new Date().toISOString(),
          };

          return {
            balance: Number((state.balance + amount).toFixed(2)),
            activity: [movement, ...state.activity].slice(0, 20),
          };
        }),
      markHydrated: () => set({ hydrated: true }),
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'wallet-store',
      storage,
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
      partialize: (state) => ({
        balance: state.balance,
        activity: state.activity,
        claimReady: state.claimReady,
      }),
    },
  ),
);

export const hydrateWalletStore = () => {
  if (useWalletStore.persist?.hasHydrated()) {
    return;
  }

  useWalletStore.persist?.rehydrate();
};
