import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Regression guards for the session gate.
 *
 * These assert the shape of the proxy's public-path rule as source text rather
 * than booting Next.js, because the bug they protect against is easy to
 * reintroduce and hard to notice: an `/api/*` request redirected to `/login`
 * comes back as HTTP 200 with `text/html`, so a `fetch()` caller silently
 * receives an HTML login page instead of a 401 and treats it as success.
 */

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8');

const middleware = read('src/lib/supabase/middleware.ts');
const proxy = read('src/proxy.ts');
const seedRoute = read('src/app/api/dev/seed/route.ts');
const problemsRoute = read('src/app/api/problems/[slug]/route.ts');

describe('session gate', () => {
  it('never redirects API routes to the login page', () => {
    expect(middleware).toContain("pathname.startsWith('/api/')");
  });

  it('keeps the auth pages and PWA assets public', () => {
    expect(middleware).toContain("'/login'");
    expect(middleware).toContain("'/register'");
    expect(middleware).toContain("'/manifest.webmanifest'");
    expect(middleware).toContain("'/sw.js'");
  });

  it('is wired into the Next.js proxy entrypoint', () => {
    expect(proxy).toContain('updateSession');
    // Next.js 16 renamed the convention; a stray `middleware.ts` is ignored.
    expect(proxy).toMatch(/export default async function proxy/);
  });
});

describe('API routes self-guard', () => {
  it('rejects unauthenticated problem reads with a JSON 401', () => {
    expect(problemsRoute).toContain('getCurrentUserId');
    expect(problemsRoute).toContain('401');
  });

  it('returns problem metadata and public tests as separate keys', () => {
    expect(problemsRoute).toContain('publicTests');
    // Hidden test cases must never be part of a client response.
    expect(problemsRoute).not.toMatch(/is_public\s*===\s*false/);
  });

  it('disables the seed endpoint in production', () => {
    expect(seedRoute).toContain("NODE_ENV === 'production'");
  });

  it('supports an optional shared secret on the seed endpoint', () => {
    expect(seedRoute).toContain('SEED_SECRET');
    expect(seedRoute).toContain('x-seed-secret');
  });
});