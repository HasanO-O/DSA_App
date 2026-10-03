import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { publicEnv } from '@/lib/env';

export interface ServerSupabaseResult {
  client: SupabaseClient | null;
  /** Present only when Supabase env vars are missing. */
  missingConfig: boolean;
}

/**
 * Per-request Supabase client bound to the caller's session cookies, so RLS
 * applies as if the client issued the query.
 */
export async function createServerSupabaseClient(): Promise<ServerSupabaseResult> {
  const url = publicEnv.supabaseUrl;
  const key = publicEnv.supabaseAnonKey;

  if (!url || !key) return { client: null, missingConfig: true };

  const cookieStore = await cookies();

  const client = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: cookie writes are not permitted and
          // the middleware already refreshed the session.
        }
      },
    },
  });

  return { client, missingConfig: false };
}

export async function getCurrentUserId(): Promise<string | null> {
  const { client } = await createServerSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}