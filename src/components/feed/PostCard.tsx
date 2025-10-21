import { memo, useMemo } from 'react';

import { Post } from '@/services/feed';
import { UnlockButton } from './UnlockButton';

interface PostCardProps {
  post: Post;
  onUnlock?: (postId: string) => Promise<void>;
}

const PostCardComponent = ({ post, onUnlock }: PostCardProps) => {
  const formattedDate = useMemo(
    () => new Date(post.createdAt).toLocaleString('es-ES'),
    [post.createdAt],
  );

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-center text-white">
          <span className="text-sm font-semibold uppercase">{post.author[0] ?? '?'}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
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
};

export const PostCard = memo(PostCardComponent);
PostCard.displayName = 'PostCard';
