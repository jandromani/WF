'use client';

import clsx from 'clsx';
import { PropsWithChildren, ReactNode, useState } from 'react';

import { Button } from './Button';

interface ConfirmProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  trigger: (props: { open: () => void }) => ReactNode;
}

export function Confirm({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  trigger,
}: PropsWithChildren<ConfirmProps>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const result = onConfirm?.();
    if (result instanceof Promise) {
      setLoading(true);
      await result.catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error(error);
        }
      });
      setLoading(false);
    }
    setOpen(false);
  };

  return (
    <>
      {trigger({ open: () => setOpen(true) })}
      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                className={clsx('text-gray-600')}
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
              <Button onClick={handleConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
