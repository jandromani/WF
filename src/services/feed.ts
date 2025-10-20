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

export interface CreatePostInput {
  content: string;
  isLocked?: boolean;
  title?: string;
  summary?: string;
  price?: number;
  creatorId?: string;
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

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const storageKey = 'wf:feed:posts';

const memoryStorage = (() => {
  const store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return key in store ? store[key] : null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
  } satisfies StorageLike;
})();

const getStorage = (): StorageLike => {
  if (typeof window !== 'undefined' && window?.localStorage) {
    return window.localStorage;
  }
  return memoryStorage;
};

const storage = getStorage();

const isDevelopment = process.env.NODE_ENV === 'development';
const devInfo = (...args: Parameters<typeof console.info>) => {
  if (isDevelopment) {
    console.info('[feed]', ...args);
  }
};

const cloneState = (value: FeedState): FeedState => ({
  posts: value.posts.map((post) => ({ ...post })),
});

const getDefaultState = (): FeedState => cloneState(initialState);

const loadState = (): FeedState => {
  try {
    const serialized = storage.getItem(storageKey);
    if (!serialized) {
      return getDefaultState();
    }
    const parsed = JSON.parse(serialized) as FeedState | { posts: Post[] } | Post[];
    if (Array.isArray(parsed)) {
      return { posts: parsed.map((post) => ({ ...post })) };
    }
    if (parsed && Array.isArray(parsed.posts)) {
      return { posts: parsed.posts.map((post) => ({ ...post })) };
    }
  } catch (error) {
    devInfo('Failed to load feed state from storage', error);
  }
  return getDefaultState();
};

let state: FeedState = loadState();

const persistState = () => {
  try {
    storage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    devInfo('Failed to persist feed state', error);
  }
};

const notify = () => {
  listeners.forEach((listener) => listener(cloneState(state)));
};

const setState = (next: FeedState) => {
  state = next;
  persistState();
  notify();
};

const updatePost = (postId: string, updater: (post: Post) => void) => {
  let changed = false;
  const nextPosts = state.posts.map((post) => {
    if (post.id !== postId) {
      return post;
    }
    const copy = { ...post };
    updater(copy);
    changed = true;
    return copy;
  });

  if (changed) {
    setState({ posts: nextPosts });
  }
  return changed;
};

const createTitleFromContent = (content: string) => {
  const trimmed = content.trim();
  if (!trimmed) {
    return 'New drop';
  }
  const line = trimmed.split('\n')[0];
  if (line.length <= 60) {
    return line;
  }
  return `${line.slice(0, 57)}...`;
};

const createPostFromInput = (input: CreatePostInput): Post => {
  const publishedAt = Date.now();
  const basePrice = input.price ?? (input.isLocked ? 3 : 0);
  const title = input.title ?? createTitleFromContent(input.content);
  const summary = input.summary ?? input.content;
  const id = `post-${publishedAt}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    creatorId: input.creatorId ?? 'you',
    title,
    summary,
    price: basePrice,
    isLocked: Boolean(input.isLocked),
    publishedAt,
    coverImage: input.coverImage,
  };
};

const api = {
  subscribe(listener: (snapshot: FeedState) => void) {
    listeners.add(listener);
    listener(cloneState(state));
    return () => listeners.delete(listener);
  },
  getSnapshot: () => cloneState(state),
  async listPosts(): Promise<Post[]> {
    devInfo('Listing posts (%d cached)', state.posts.length);
    return cloneState(state).posts;
  },
  async createPost(input: CreatePostInput): Promise<Post> {
    const newPost = createPostFromInput(input);
    setState({ posts: [newPost, ...state.posts] });
    devInfo('Created post %s', newPost.id);
    return { ...newPost };
  },
  async unlockPost(postId: string): Promise<{ success: boolean }> {
    const success = updatePost(postId, (post) => {
      post.isLocked = false;
    });
    devInfo(success ? `Unlocked post ${postId}` : `No post found for ${postId}`);
    return { success };
  },
  async unlockPostsByCreator(creatorId: string) {
    let changed = false;
    const nextPosts = state.posts.map((post) => {
      if (post.creatorId !== creatorId) {
        return post;
      }
      changed = true;
      return { ...post, isLocked: false };
    });

    if (changed) {
      setState({ posts: nextPosts });
      devInfo('Unlocked posts by creator %s', creatorId);
    }
  },
};

export const feedService = api;
export const feed = api;

export const listPosts = api.listPosts;
export const createPost = api.createPost;
export const unlockPost = api.unlockPost;

export type FeedService = typeof feedService;
