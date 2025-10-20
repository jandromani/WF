import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AuthState {
  worldIdVerified: boolean;
  setWorldIdVerified: (verified: boolean) => void;
  reset: () => void;
}

const storage =
  typeof window === 'undefined'
    ? undefined
    : createJSONStorage(() => window.localStorage);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      worldIdVerified: false,
      setWorldIdVerified: (verified) => set({ worldIdVerified: verified }),
      reset: () => set({ worldIdVerified: false }),
    }),
    {
      name: 'wf-auth-store',
      ...(storage ? { storage } : {}),
    },
  ),
);
