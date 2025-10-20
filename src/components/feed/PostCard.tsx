import { Post } from '@/services/feed';
import { UnlockButton } from './UnlockButton';

interface PostCardProps {
  post: Post;
  onUnlock?: (postId: string) => Promise<void>;
}

export function PostCard({ post, onUnlock }: PostCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-center text-white">
          <span className="flex h-full w-full items-center justify-center text-sm font-semibold">
            {post.authorName[0] ?? '?'}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString('es-ES')}
          </p>
        </div>
      </header>
      <div className="mt-4 text-sm text-gray-800">
        {post.isLocked && !post.unlocked ? (
          <p className="italic text-gray-500">
            Contenido premium. Desbloquéalo para ver el mensaje completo.
          </p>
        ) : (
          <p>{post.content}</p>
        )}
      </div>
      <footer className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>{post.tipsTotal} WFANS en tips</span>
        {post.isLocked && !post.unlocked && onUnlock ? (
          <UnlockButton postId={post.id} onUnlock={onUnlock} />
        ) : null}
      </footer>
    </article>
  );
}
