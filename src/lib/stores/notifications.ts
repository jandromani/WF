import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  add: (notification: Omit<NotificationItem, 'id'>) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  add: (notification) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
    set((state) => ({
      notifications: [{ id, ...notification }, ...state.notifications].slice(0, 5),
    }));
  },
  clear: () => set({ notifications: [] }),
}));
