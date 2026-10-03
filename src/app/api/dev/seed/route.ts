import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/problems/repository';

/**
 * Development-only seeding endpoint.
 *
 * Uploads the bundled dataset into Supabase via the service-role client (which
 * bypasses RLS). It is deliberately unavailable in production and, because the
 * proxy allows `/api/*` through, it self-guards rather than relying on a redirect.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' }, { status: 503 });
  }

  // A shared secret keeps a casual localhost request from writing to the
  // database. The value is supplied by the developer, never shipped to clients.
  const expected = process.env.SEED_SECRET;
  if (expected) {
    const provided = request.headers.get('x-seed-secret');
    if (provided !== expected) {
      return NextResponse.json({ error: 'Invalid or missing x-seed-secret header' }, { status: 401 });
    }
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Seeding failed' },
      { status: 500 },
    );
  }
}