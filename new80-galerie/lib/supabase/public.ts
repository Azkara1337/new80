import { createClient } from '@supabase/supabase-js';

/** Client anonyme pour les pages publiques (pas de cookies). Les règles RLS ne laissent voir que les soirées publiées. */
export function publicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
