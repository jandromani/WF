'use client';

import Link from 'next/link';

import { useCreators } from '@/lib/hooks/useCreators';

export default function CreatorsPage() {
  const { creators, isLoading } = useCreators();

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Creadores</h1>
        <p className="text-sm text-gray-500">
          Descubre nuevos perfiles y apóyalos con WFANS.
        </p>
      </header>
      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
            ))
          : creators?.map((creator) => (
              <Link
                key={creator.id}
                href={`/creators/${creator.id}`}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {creator.name}
                  </h2>
                  <p className="text-sm text-gray-500">{creator.description}</p>
                  <p className="text-xs text-gray-400">
                    {creator.subscribers.toLocaleString()} fans · {creator.subscriptionPrice} WFANS/mes
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-500">Ver perfil →</span>
              </Link>
            ))}
        {!isLoading && !creators?.length ? (
          <p className="text-sm text-gray-500">
            Aún no hay creadores disponibles. ¡Vuelve pronto!
          </p>
        ) : null}
      </div>
    </div>
  );
}
