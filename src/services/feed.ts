export type Post = {
  id: string;
  author: string;
  content: string;
  price?: number;
  unlocked?: boolean;
  createdAt: string;
};

let _posts: Post[] = [
  { id: '1', author: 'alice', content: 'Hola WorldFans!', createdAt: new Date().toISOString() },
  {
    id: '2',
    author: 'bob',
    content: 'Contenido premium 🔒',
    price: 10,
    unlocked: false,
    createdAt: new Date().toISOString(),
  },
];

export async function listPosts(): Promise<Post[]> {
  return _posts;
}

export type CreatePostInput = { content: string; price?: number; author?: string };

export async function createPost(p: CreatePostInput): Promise<Post> {
  const post: Post = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    author: p.author ?? 'anon',
    content: p.content,
    price: p.price,
    unlocked: !p.price,
  };
  _posts = [post, ..._posts];
  return post;
}

export async function unlockPost(id: string): Promise<Post> {
  _posts = _posts.map((p) => (p.id === id ? { ...p, unlocked: true } : p));
  const post = _posts.find((p) => p.id === id)!;
  return post;
}
