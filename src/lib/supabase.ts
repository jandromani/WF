import { createClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

let client: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (client) {
    return client;
  }
  if (!env.supabase.url || !env.supabase.anonKey) {
    throw new Error('Configura las variables de entorno de Supabase');
  }
  client = createClient(env.supabase.url, env.supabase.anonKey, {
    auth: { persistSession: false },
  });
  return client;
};
