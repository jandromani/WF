'use client';

export interface Post {
  id: string;
  creatorId: string;
  title: string;
  summary: string;
  price: number;
  isLocked: boolean;
  publishedAt: number;
  coverImage?: string;
}

interface FeedState {
  posts: Post[];
}

const listeners = new Set<(state: FeedState) => void>();

const now = Date.now();

const initialState: FeedState = {
  posts: [
    {
      id: 'post-1',
      creatorId: 'alex',
      title: 'World Chain deep dive drop',
      summary: 'Unlock the full set of renders from my latest World Chain concept art.',
      price: 4,
      isLocked: true,
      publishedAt: now - 1000 * 60 * 45,
    },
    {
      id: 'post-2',
      creatorId: 'zara',
      title: 'Studio session: unreleased track',
      summary: 'Hear the raw cut of my upcoming single before anyone else.',
      price: 3,
      isLocked: false,
      publishedAt: now - 1000 * 60 * 120,
    },
  ],
};

let state: FeedState = initialState;

const clone = (value: FeedState): FeedState => ({
  posts: value.posts.map((post) => ({ ...post })),
});

const notify = () => {
  listeners.forEach((listener) => listener(clone(state)));
};

const updatePost = (postId: string, updater: (post: Post) => void) => {
  state = {
    posts: state.posts.map((post) => {
      if (post.id !== postId) {
        return post;
      }
      const copy = { ...post };
      updater(copy);
      return copy;
    }),
  };
  notify();
};

const api = {
  subscribe(listener: (snapshot: FeedState) => void) {
    listeners.add(listener);
    listener(clone(state));
    return () => listeners.delete(listener);
  },
  getSnapshot: () => clone(state),
  async unlockPost(postId: string) {
    updatePost(postId, (post) => {
      post.isLocked = false;
    });
  },
  async unlockPostsByCreator(creatorId: string) {
    state = {
      posts: state.posts.map((post) =>
        post.creatorId === creatorId ? { ...post, isLocked: false } : post,
      ),
    };
    notify();
  },
};

export const feedService = api;
export const feed = api;

export type FeedService = typeof feedService;
