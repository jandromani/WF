'use client';

import clsx from 'clsx';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type ToastStatus = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  title: string;
  status: ToastStatus;
}

interface ToastContextValue {
  showToast: (title: string, status?: ToastStatus) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, status: ToastStatus = 'info') => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;
    setMessages((prev) => [...prev, { id, title, status }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((message) => message.id !== id));
    }, 3500);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed left-1/2 top-4 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx(
              'rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur transition-all',
              message.status === 'success' && 'border-green-500 bg-green-50 text-green-900',
              message.status === 'error' && 'border-red-500 bg-red-50 text-red-900',
              message.status === 'info' && 'border-gray-200 bg-white text-gray-900',
            )}
          >
            {message.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return context;
};
