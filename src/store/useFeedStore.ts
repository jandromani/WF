import { notify } from '@/lib/minikit';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FeedPost = {
  id: string;
  title: string;
  excerpt: string;
  premium: boolean;
  unlocked: boolean;
  author: string;
};

type FeedState = {
  posts: FeedPost[];
  loading: boolean;
  hydrated: boolean;
  paginate: () => Promise<void>;
  unlock: (id: string) => Promise<void>;
  markHydrated: () => void;
  reset: () => void;
};

const initialPosts: FeedPost[] = [
  {
    id: 'post-1',
    title: 'Cómo crecer en World App',
    excerpt: 'Estrategias para aumentar tu comunidad en Web3.',
    premium: false,
    unlocked: true,
    author: 'Sofía Codes',
  },
  {
    id: 'post-2',
    title: 'Ideas exclusivas para miembros premium',
    excerpt: 'Accede a utilidades avanzadas con ejemplos listos.',
    premium: true,
    unlocked: false,
    author: 'Builders DAO',
  },
];

type FeedStorageState = Pick<FeedState, 'posts'>;

const storage =
  typeof window === 'undefined'
    ? undefined
    : createJSONStorage<FeedStorageState>(() => localStorage);

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      posts: initialPosts,
      loading: false,
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      reset: () => set({ posts: initialPosts, loading: false }),
      paginate: async () => {
        if (get().loading) {
          return;
        }

        set({ loading: true });

        await new Promise((resolve) => setTimeout(resolve, 300));

        const nextPostIndex = get().posts.length + 1;
        const newPost: FeedPost = {
          id: `post-${nextPostIndex}`,
          title: `Novedades exclusivas #${nextPostIndex}`,
          excerpt: 'Contenido premium preparado para desbloquear.',
          premium: nextPostIndex % 2 === 0,
          unlocked: nextPostIndex % 2 !== 0,
          author: nextPostIndex % 2 === 0 ? 'World App Creators' : 'Community Lab',
        };

        set({ posts: [...get().posts, newPost], loading: false });
      },
      unlock: async (id: string) => {
        const post = get().posts.find((item) => item.id === id);
        if (!post || !post.premium || post.unlocked) {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));

        set({
          posts: get().posts.map((item) =>
            item.id === id ? { ...item, unlocked: true } : item,
          ),
        });

        await notify({
          title: 'Post premium desbloqueado',
          body: `${post.title} ya está disponible.`,
        });
      },
    }),
    {
      name: 'feed-store',
      storage,
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
      partialize: (state) => ({ posts: state.posts }),
    },
  ),
);

export const hydrateFeedStore = () => {
  if (useFeedStore.persist?.hasHydrated()) {
    return;
  }

  useFeedStore.persist?.rehydrate();
};
