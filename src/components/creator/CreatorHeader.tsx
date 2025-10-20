import { CreatorProfile } from '@/services/creators';

interface CreatorHeaderProps {
  creator: CreatorProfile;
}

export function CreatorHeader({ creator }: CreatorHeaderProps) {
  return (
    <header className="flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-6 text-white">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-white/20 text-center">
          <span className="flex h-full w-full items-center justify-center text-xl font-semibold">
            {creator.name[0] ?? '?'}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{creator.name}</h1>
          <p className="text-sm text-white/80">{creator.description}</p>
        </div>
      </div>
      <dl className="flex gap-6 text-sm">
        <div>
          <dt className="text-white/70">Suscriptores</dt>
          <dd className="text-lg font-semibold">{creator.subscribers.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-white/70">Posts</dt>
          <dd className="text-lg font-semibold">{creator.posts}</dd>
        </div>
      </dl>
      {creator.categories.length ? (
        <div className="flex flex-wrap gap-2 text-xs">
          {creator.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-white/20 px-3 py-1 font-medium uppercase tracking-wide"
            >
              {category}
            </span>
          ))}
        </div>
      ) : null}
    </header>
  );
}
