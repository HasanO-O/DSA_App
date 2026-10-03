import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { publicEnv } from '@/lib/env';

const PUBLIC_PATHS = ['/', '/login', '/register', '/manifest.webmanifest'];

/**
 * Paths that must never be redirected to /login.
 *
 * API routes are included deliberately: redirecting a `fetch()` or
 * `POST /api/...` to an HTML login page turns a machine-readable error into a
 * 200 with `text/html`, which is far harder to debug than a 401. Each route
 * handler is responsible for its own auth check.
 */
function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/api/')) return true;
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/sw.js' ||
    pathname === '/favicon.ico'
  );
}

/**
 * Refreshes the Supabase auth cookie on every request and gates protected routes.
 * Without this the server client would read a stale JWT and RLS would reject reads.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = publicEnv.supabaseUrl;
  const key = publicEnv.supabaseAnonKey;

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getClaims() refreshes the token when needed and returns null when signed out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub as string | undefined;

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}