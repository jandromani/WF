'use client';

import { PostCard } from './PostCard';

import { Post } from '@/services/feed';

interface FeedListProps {
  posts?: Post[];
  isLoading?: boolean;
  onUnlock: (postId: string) => Promise<void>;
}

export function FeedList({ posts, isLoading, onUnlock }: FeedListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        No hay posts todavía. Sé el primero en compartir algo.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUnlock={onUnlock} />
      ))}
    </div>
  );
}
