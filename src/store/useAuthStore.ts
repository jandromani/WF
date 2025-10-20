import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  address: string | null;
  username: string | null;
  worldIdVerified: boolean;
  hydrated: boolean;
  setAuth: (payload: { address: string | null; username: string | null }) => void;
  setWorldIdVerified: (value: boolean) => void;
  setHydrated: () => void;
  reset: () => void;
};

type AuthStorageState = Pick<
  AuthState,
  'address' | 'username' | 'worldIdVerified'
>;

const storage =
  typeof window === 'undefined'
    ? undefined
    : createJSONStorage<AuthStorageState>(() => localStorage);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      address: null,
      username: null,
      worldIdVerified: false,
      hydrated: false,
      setAuth: ({ address, username }) =>
        set({ address: address ?? null, username: username ?? null }),
      setWorldIdVerified: (value) => set({ worldIdVerified: value }),
      setHydrated: () => set({ hydrated: true }),
      reset: () =>
        set({
          address: null,
          username: null,
          worldIdVerified: false,
        }),
    }),
    {
      name: 'auth-store',
      storage,
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        address: state.address,
        username: state.username,
        worldIdVerified: state.worldIdVerified,
      }),
    },
  ),
);

export const hydrateAuthStore = () => {
  if (useAuthStore.persist?.hasHydrated()) {
    return;
  }

  useAuthStore.persist?.rehydrate();
};
