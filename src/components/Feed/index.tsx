'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';

import { useFeedStore } from '@/store/useFeedStore';

export const Feed = () => {
  const posts = useFeedStore((state) => state.posts);
  const loading = useFeedStore((state) => state.loading);
  const paginate = useFeedStore((state) => state.paginate);
  const unlock = useFeedStore((state) => state.unlock);

  return (
    <div
      className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid="feed"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-base font-semibold">Tu feed</p>
          <p className="text-sm text-slate-500">
            Explora las últimas publicaciones de la comunidad.
          </p>
        </div>
        <Button
          variant="tertiary"
          size="sm"
          onClick={paginate}
          disabled={loading}
          data-testid="feed-paginate"
        >
          {loading ? 'Cargando…' : 'Ver más'}
        </Button>
      </div>
      <div className="grid gap-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-lg border border-slate-200 p-3"
            data-testid={`feed-post-${post.id}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{post.title}</p>
                <p className="text-xs text-slate-500">Por {post.author}</p>
              </div>
              {post.premium && !post.unlocked && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => unlock(post.id)}
                  data-testid={`unlock-${post.id}`}
                >
                  Desbloquear
                </Button>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {post.unlocked
                ? post.excerpt
                : 'Contenido premium. Desbloquéalo para leerlo al instante.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
