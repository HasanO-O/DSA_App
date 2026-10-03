import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Session gate (Next.js 16 renamed the `middleware` convention to `proxy`).
 *
 * Refreshes the Supabase auth cookie on every matched request and redirects
 * signed-out users to /login, so server components always read a valid JWT and
 * RLS applies as intended.
 */
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};