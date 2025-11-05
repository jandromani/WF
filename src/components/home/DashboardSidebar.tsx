'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { useCreators } from '@/lib/hooks/useCreators';
import { useFeed } from '@/lib/hooks/useFeed';
import { useWallet } from '@/lib/hooks/useWallet';

export function DashboardSidebar() {
  const { creators } = useCreators();
  const { posts } = useFeed();
  const { balance } = useWallet();

  const topCreators = useMemo(() => creators?.slice(0, 3) ?? [], [creators]);
  const trendingPosts = useMemo(
    () => posts?.filter((post) => !post.nsfw).slice(0, 3) ?? [],
    [posts],
  );

  const totalLocked = useMemo(
    () => posts?.filter((post) => post.price && !post.unlocked).length ?? 0,
    [posts],
  );

  return (
    <div className="space-y-6" data-testid="dashboard-sidebar">
      <section className="space-y-3">
        <header>
          <h2 className="text-sm font-semibold text-slate-900">Top creators</h2>
          <p className="text-xs text-slate-500">Basado en suscriptores y actividad on-chain.</p>
        </header>
        <ul className="space-y-2">
          {topCreators.map((creator) => (
            <li
              key={creator.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{creator.handle}</p>
                <p className="text-xs text-slate-500">
                  {creator.price} WFANS · {creator.subscribers} fans
                </p>
              </div>
              <Link
                href={`/creators/${creator.id}`}
                className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                data-testid={`sidebar-top-${creator.id}`}
              >
                Ver
              </Link>
            </li>
          ))}
          {!topCreators.length ? (
            <li className="rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
              No hay creadores destacados todavía.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-3">
        <header>
          <h2 className="text-sm font-semibold text-slate-900">Trending ahora</h2>
          <p className="text-xs text-slate-500">Lo más compartido en las últimas horas.</p>
        </header>
        <ul className="space-y-2">
          {trendingPosts.map((post) => (
            <li key={post.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">{post.authorName ?? post.author}</p>
              <p className="line-clamp-2 text-slate-600">{post.content}</p>
            </li>
          ))}
          {!trendingPosts.length ? (
            <li className="rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
              Todavía no hay publicaciones destacadas.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-3">
        <header>
          <h2 className="text-sm font-semibold text-slate-900">Stats rápidas</h2>
          <p className="text-xs text-slate-500">Indicadores live del ecosistema WFANS.</p>
        </header>
        <div className="grid gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Balance disponible</p>
            <p className="text-lg font-semibold text-slate-900">{balance.toFixed(3)} WFANS</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Posts activos</p>
            <p className="text-lg font-semibold text-slate-900">{posts?.length ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Premium bloqueado</p>
            <p className="text-lg font-semibold text-slate-900">{totalLocked}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
