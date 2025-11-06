import { getSupabase } from '@/lib/supabase';

export type Creator = {
  id: string;
  handle: string;
  price: number;
  subscribers: number;
  avatarUrl?: string;
  bio?: string;
};

type CreatorRow = {
  id: string;
  handle?: string | null;
  price?: number | null;
  subscribers?: number | null;
  avatar_url?: string | null;
  bio?: string | null;
};

const localCreators: Creator[] = [
  { id: 'alice', handle: '@alice', price: 50, subscribers: 12 },
  { id: 'bob', handle: '@bob', price: 25, subscribers: 31 },
];

const mapRowToCreator = (row: CreatorRow): Creator => ({
  id: row.id,
  handle: row.handle ?? `@${row.id}`,
  price: row.price ?? 0,
  subscribers: row.subscribers ?? 0,
  avatarUrl: row.avatar_url ?? undefined,
  bio: row.bio ?? undefined,
});

export async function listCreators() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('creators')
      .select('id, handle, price, subscribers, avatar_url, bio')
      .order('subscribers', { ascending: false });
    if (error) {
      throw error;
    }
    if (!data) {
      return localCreators;
    }
    return data.map(mapRowToCreator);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Fallo al cargar creadores', error);
    }
    return localCreators;
  }
}

export async function getCreator(id: string) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('creators')
      .select('id, handle, price, subscribers, avatar_url, bio')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (!data) {
      return localCreators.find((c) => c.id === id) ?? null;
    }
    return mapRowToCreator(data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Fallo al cargar creador', error);
    }
    return localCreators.find((c) => c.id === id) ?? null;
  }
}

export async function subscribe(id: string) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.rpc('increment_subscribers', { creator_id: id });
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Fallo al suscribirse', error);
    }
    return true;
  }
}
