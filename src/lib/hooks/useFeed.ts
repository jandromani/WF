'use client';

import useSWR from 'swr';

import {
  CreatePostInput,
  Post,
  createPost,
  listPosts,
  unlockPost,
} from '@/services/feed';

interface FeedHook {
  posts?: Post[];
  isLoading: boolean;
  error?: Error;
  create: (input: CreatePostInput) => Promise<Post>;
  unlock: (postId: string) => Promise<{ success: boolean }>;
  refresh: () => Promise<void>;
}

const feedKey = ['feed'];

export function useFeed(): FeedHook {
  const { data, error, isLoading, mutate } = useSWR<Post[], Error>(
    feedKey,
    listPosts,
  );

  const refresh = async () => {
    await mutate();
  };

  const createHandler = async (input: CreatePostInput) => {
    const newPost = await createPost(input);
    await mutate((posts) => (posts ? [newPost, ...posts] : [newPost]), {
      revalidate: false,
    });
    return newPost;
  };

  const unlockHandler = async (postId: string) => {
    const result = await unlockPost(postId);
    await mutate(
      (posts) =>
        posts?.map((post) =>
          post.id === postId ? { ...post, unlocked: true, isLocked: false } : post,
        ),
      { revalidate: false },
    );
    return result;
  };

  return {
    posts: data,
    isLoading,
    error: error ?? undefined,
    create: createHandler,
    unlock: unlockHandler,
    refresh,
  };
}
