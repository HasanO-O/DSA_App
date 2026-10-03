import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getProblem } from '@/lib/problems/repository';
import { getCurrentUserId } from '@/lib/supabase/server';

const querySchema = z.object({
  slug: z.string().min(1),
});

/**
 * Problem detail endpoint.
 *
 * Requires a signed-in user, enforced here rather than in the proxy: the proxy
 * deliberately lets `/api/*` through so failures surface as JSON rather than as
 * an HTML login redirect. Returns PUBLIC test cases only — hidden test cases are
 * never serialized into a client response (spec §14/§27).
 */
export async function GET(request: NextRequest) {
  if (!(await getCurrentUserId())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ slug: url.searchParams.get('slug') });

  if (!parsed.success) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const problem = await getProblem(parsed.data.slug);
  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  // `publicTests` is lifted to a top-level key and removed from the problem
  // object so the metadata shape stays identical to the `problems` table row.
  const { publicTests, ...metadata } = problem;

  return NextResponse.json({ problem: metadata, publicTests });
}