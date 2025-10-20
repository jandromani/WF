export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  avatarUrl?: string;
  content: string;
  isLocked: boolean;
  createdAt: string;
  tipsTotal: number;
  unlocked?: boolean;
}

export interface CreatePostInput {
  content: string;
  isLocked?: boolean;
}

const FEED_ENDPOINT = '/api/feed';

const withFallback = async <T>(request: () => Promise<T>, fallback: T) => {
  try {
    return await request();
  } catch (error) {
    console.warn('Falling back to placeholder data for', FEED_ENDPOINT, error);
    return fallback;
  }
};

export async function listPosts(): Promise<Post[]> {
  return withFallback(
    async () => {
      const response = await fetch(FEED_ENDPOINT, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }
      const body = (await response.json()) as { posts: Post[] };
      return body.posts;
    },
    [
      {
        id: 'placeholder-1',
        authorId: 'creator-1',
        authorName: 'World Builder',
        content:
          'Bienvenido a WorldFans: comparte contenido exclusivo y recompensa a tus fans.',
        isLocked: false,
        createdAt: new Date().toISOString(),
        tipsTotal: 42,
        unlocked: true,
      },
      {
        id: 'placeholder-2',
        authorId: 'creator-2',
        authorName: 'Pioneer',
        content:
          'Desbloquea este post premium para ver el detrás de cámaras de la última sesión.',
        isLocked: true,
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        tipsTotal: 12,
        unlocked: false,
      },
    ],
  );
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  return withFallback(
    async () => {
      const response = await fetch(FEED_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const body = (await response.json()) as { post: Post };
      return body.post;
    },
    {
      id: `local-${Date.now()}`,
      authorId: 'you',
      authorName: 'Tú',
      content: input.content,
      isLocked: Boolean(input.isLocked),
      createdAt: new Date().toISOString(),
      tipsTotal: 0,
      unlocked: true,
    },
  );
}

export async function unlockPost(postId: string): Promise<{ success: boolean }>
{
  return withFallback(
    async () => {
      const response = await fetch(`${FEED_ENDPOINT}/${postId}/unlock`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to unlock post');
      }

      return (await response.json()) as { success: boolean };
    },
    { success: true },
  );
}
