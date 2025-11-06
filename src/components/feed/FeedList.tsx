'use client';

import { useMemo, useState } from 'react';

import { Post } from '@/services/feed';
import { PostCard } from '@/components/feed/PostCard';

interface FeedListProps {
  posts?: Post[];
  isLoading?: boolean;
  onUnlock?: (postId: string) => Promise<unknown>;
}

export function FeedList({ posts = [], isLoading, onUnlock }: FeedListProps) {
  const [showNsfw, setShowNsfw] = useState(false);

  const filteredPosts = useMemo(() => {
    if (showNsfw) {
      return posts;
    }
    return posts.filter((post) => !post.nsfw);
  }, [posts, showNsfw]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm">
        <p className="font-medium text-gray-700">Contenido +18</p>
        <label className="inline-flex items-center gap-2 text-xs text-gray-500">
          <span>Mostrar</span>
          <input
            type="checkbox"
            checked={showNsfw}
            onChange={(event) => setShowNsfw(event.target.checked)}
          />
        </label>
      </div>
      {isLoading && !filteredPosts.length ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          Cargando feed...
        </div>
      ) : null}
      {filteredPosts.map((post) => (
        <PostCard key={post.id} post={post} onUnlock={onUnlock} />
      ))}
      {!filteredPosts.length && !isLoading ? (
        <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No hay publicaciones disponibles. Ajusta tus filtros o crea una nueva actualización.
        </p>
      ) : null}
    </div>
  );
}
