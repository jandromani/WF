'use client';

import { UnlockButton } from '@/components/Creators/UnlockButton';
import { feedService } from '@/services/feed';
import { useSyncExternalStore } from 'react';

const useFeed = () =>
  useSyncExternalStore(feedService.subscribe, feedService.getSnapshot, feedService.getSnapshot);

export const FeedList = () => {
  const { posts } = useFeed();

  return (
    <section className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Creator feed
        </p>
        <h2 className="text-xl font-semibold text-slate-900">
          Unlock exclusive drops
        </h2>
      </header>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="flex flex-col gap-3 rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">{post.title}</p>
                <p className="text-sm text-slate-500">{post.summary}</p>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {post.price} WLDY
              </span>
            </div>
            {post.isLocked ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-600">
                  This content is locked. Unlock to view the full post.
                </p>
                <UnlockButton post={post} />
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p>
                  Content unlocked! Enjoy this exclusive drop.
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
