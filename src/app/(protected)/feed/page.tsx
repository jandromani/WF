'use client';

import { Composer } from '@/components/feed/Composer';
import { FeedList } from '@/components/feed/FeedList';
import { useFeed } from '@/lib/hooks/useFeed';
import { useAuthStore } from '@/lib/stores/auth';

export default function FeedPage() {
  const { posts, create, unlock, isLoading } = useFeed();
  const worldIdVerified = useAuthStore((state) => state.worldIdVerified);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Feed</h1>
        <p className="text-sm text-gray-500">
          Publica, desbloquea y participa con tus creadores favoritos.
        </p>
      </header>
      <Composer onSubmit={create} disabled={!worldIdVerified} />
      <FeedList
        posts={posts}
        isLoading={isLoading}
        onUnlock={async (postId) => {
          await unlock(postId);
        }}
      />
    </div>
  );
}
