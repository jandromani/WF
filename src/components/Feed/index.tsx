'use client';

import { Composer } from '@/components/feed/Composer';
import { FeedList } from '@/components/feed/FeedList';
import { CreatePostInput, Post } from '@/services/feed';

interface FeedProps {
  posts?: Post[];
  isLoading?: boolean;
  onCreate: (input: CreatePostInput) => Promise<Post>;
  onUnlock: (postId: string) => Promise<{ success: boolean }>;
  disableCreate?: boolean;
}

export function Feed({ posts, isLoading, onCreate, onUnlock, disableCreate }: FeedProps) {
  return (
    <section className="space-y-4">
      <Composer onSubmit={onCreate} disabled={disableCreate} />
      <FeedList
        posts={posts}
        isLoading={isLoading}
        onUnlock={async (postId) => {
          await onUnlock(postId);
        }}
      />
    </section>
  );
}
