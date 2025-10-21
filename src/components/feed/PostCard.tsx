import { Post } from '@/services/feed';
import { UnlockButton } from './UnlockButton';

interface PostCardProps {
  post: Post;
  onUnlock?: (postId: string) => Promise<void>;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export function PostCard({ post, onUnlock }: PostCardProps) {
  const isLocked = Boolean(post.price && !post.unlocked);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-center text-white">
          <span className="text-sm font-semibold uppercase">{post.author[0] ?? '?'}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{post.author}</p>
          <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
        </div>
      </header>
      <div className="mt-4 text-sm text-gray-800">
        {isLocked ? (
          <p className="italic text-gray-500">
            Contenido premium. Desbloquéalo para ver el mensaje completo.
          </p>
        ) : (
          <p>{post.content}</p>
        )}
      </div>
      <footer className="mt-4 flex items-center justify-between text-xs text-gray-500">
        {post.price ? <span>{post.price} WFANS</span> : <span>Gratis</span>}
        {isLocked && onUnlock ? (
          <UnlockButton postId={post.id} onUnlock={onUnlock} />
        ) : null}
      </footer>
    </article>
  );
}
