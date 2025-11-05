import { getSupabase } from '@/lib/supabase';

export type Post = {
  id: string;
  author: string;
  authorName?: string;
  content: string;
  price?: number;
  unlocked?: boolean;
  nsfw?: boolean;
  createdAt: string;
};

type PostRow = {
  id: string;
  author: string;
  author_name?: string | null;
  content: string;
  price?: number | null;
  unlocked?: boolean | null;
  nsfw?: boolean | null;
  created_at?: string | null;
};

const localPosts: Post[] = [
  {
    id: 'seed-1',
    author: 'alice',
    authorName: 'Alice Builder',
    content: 'Hola WorldFans!',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    author: 'bob',
    authorName: 'Bob Creator',
    content: 'Contenido premium 🔒',
    price: 10,
    unlocked: false,
    nsfw: true,
    createdAt: new Date().toISOString(),
  },
];

const mapRowToPost = (row: PostRow): Post => ({
  id: row.id,
  author: row.author,
  authorName: row.author_name ?? row.author,
  content: row.content,
  price: row.price ?? undefined,
  unlocked: Boolean(row.unlocked),
  nsfw: Boolean(row.nsfw),
  createdAt: row.created_at ?? new Date().toISOString(),
});

export async function listPosts(): Promise<Post[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('id, author, author_name, content, price, unlocked, created_at, nsfw')
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    if (!data) {
      return localPosts;
    }
    return data.map(mapRowToPost);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Fallo al cargar feed desde Supabase', error);
    }
    return localPosts;
  }
}

export type CreatePostInput = {
  content: string;
  price?: number;
  author?: string;
  authorName?: string;
  nsfw?: boolean;
};

export async function createPost(p: CreatePostInput): Promise<Post> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .insert({
        content: p.content,
        price: p.price,
        author: p.author ?? 'anon',
        author_name: p.authorName ?? p.author,
        unlocked: !p.price,
        nsfw: p.nsfw ?? false,
      })
      .select()
      .single();
    if (error) {
      throw error;
    }
    return mapRowToPost(data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Fallo al crear post en Supabase', error);
    }
    const fallback: Post = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      author: p.author ?? 'anon',
      authorName: p.authorName ?? p.author ?? 'anon',
      content: p.content,
      price: p.price,
      unlocked: !p.price,
      nsfw: p.nsfw,
    };
    localPosts.unshift(fallback);
    return fallback;
  }
}

export async function unlockPost(id: string): Promise<Post> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .update({ unlocked: true })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      throw error;
    }
    return mapRowToPost(data);
  } catch (error) {
    const fallback = localPosts.find((post) => post.id === id);
    if (fallback) {
      fallback.unlocked = true;
      return fallback;
    }
    throw error;
  }
}
