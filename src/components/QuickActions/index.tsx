'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';

import { notify, share } from '@/lib/minikit';

const buildDeepLink = (path: string) => `worldapp://mini-app?path=${encodeURIComponent(path)}`;

const shareDeepLink = async (url: string, title: string) => {
  const sharePayload = {
    url,
    title,
    text: title,
  };

  try {
    await share(sharePayload);
  } catch (error) {
    console.warn('Failed to share deep link', error);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        if (process.env.NODE_ENV !== 'production') {
          console.info('Copied deep link to clipboard as fallback');
        }
      } catch (clipboardError) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Failed to copy deep link to clipboard', clipboardError);
        }
      }
    }
  }
};

export const QuickActions = () => {
  const onShareCreator = async () => {
    const url = buildDeepLink('/creators/alex-world');
    await shareDeepLink(url, 'Comparte un creador');
    await notify({
      title: 'Nuevo seguidor',
      body: 'Alex World acaba de seguirte de vuelta.',
    });
  };

  const onSharePost = async () => {
    const url = buildDeepLink('/creators/alex-world/posts/premium');
    await shareDeepLink(url, 'Comparte un post premium');
  };

  return (
    <div
      className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid="quick-actions"
    >
      <p className="mb-3 text-base font-semibold">Acciones rápidas</p>
      <div className="flex flex-col gap-3">
        <Button variant="tertiary" onClick={onShareCreator} data-testid="share-creator">
          Compartir creador
        </Button>
        <Button variant="secondary" onClick={onSharePost} data-testid="share-post">
          Compartir post premium
        </Button>
      </div>
    </div>
  );
};
