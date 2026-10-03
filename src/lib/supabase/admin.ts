import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { publicEnv } from '@/lib/env';

/**
 * Service-role Supabase client. SERVER ONLY — this bypasses Row Level Security,
 * so it must never be imported from a Client Component.
 *
 * Use it for: seeding, server-side test-case loading (hidden tests), and
 * authenticated writes that need the acting user's id explicitly.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = publicEnv.supabaseUrl;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}