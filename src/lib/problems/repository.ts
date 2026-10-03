import { SEED_PROBLEMS, groupProblemsByCategory, type SeedProblem } from './seed';
import {
  problemSchema,
  problemDetailSchema,
  type Problem,
  type ProblemDetail,
  type PublicTestCase,
} from '@/types/problem';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Problem access layer.
 *
 * Two sources, in priority order:
 *  1. Supabase `problems` + `test_cases` (authoritative once seeded / extended).
 *  2. The bundled seed dataset, so the app is fully usable before any cloud
 *     setup and keeps working when the network is unavailable.
 *
 * Both paths return the same normalized shapes. The UI never knows which was used.
 */

interface ProblemRow {
  id: string;
  leetcode_slug: string;
  title: string;
  difficulty: string;
  category: string;
  pattern: string;
  neetcode_order: number;
  leetcode_url: string;
  summary: string | null;
  tags: unknown;
  entry_function: string | null;
}

interface TestCaseRow {
  id: string;
  problem_id: string;
  input: unknown;
  expected_output: unknown;
  is_public: boolean;
}

function toProblem(row: ProblemRow): Problem {
  const tags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
  return problemSchema.parse({
    id: row.id,
    leetcodeSlug: row.leetcode_slug,
    title: row.title,
    difficulty: row.difficulty,
    category: row.category,
    pattern: row.pattern,
    neetcodeOrder: row.neetcode_order,
    leetcodeUrl: row.leetcode_url,
    summary: row.summary ?? '',
    tags,
    entryFunction: row.entry_function ?? 'solve',
  });
}

function seedToProblem(seed: SeedProblem): Problem {
  return problemSchema.parse(seed);
}

export async function listProblems(): Promise<Problem[]> {
  const { client } = await createServerSupabaseClient();
  if (client) {
    const { data, error } = await client
      .from('problems')
      .select(
        'id, leetcode_slug, title, difficulty, category, pattern, neetcode_order, leetcode_url, summary, tags, entry_function',
      )
      .order('neetcode_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row) => toProblem(row as unknown as ProblemRow));
    }
  }
  return SEED_PROBLEMS.map(seedToProblem);
}

/**
 * Full detail for one problem, including PUBLIC test cases only.
 * Hidden test cases are never returned from this function — they are loaded
 * separately on the server during execution.
 */
export async function getProblem(idOrSlug: string): Promise<ProblemDetail | null> {
  const { client } = await createServerSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from('problems')
      .select(
        'id, leetcode_slug, title, difficulty, category, pattern, neetcode_order, leetcode_url, summary, tags, entry_function',
      )
      .eq('id', idOrSlug)
      .maybeSingle();

    if (!error && data) {
      const problem = toProblem(data as unknown as ProblemRow);
      const { data: tests } = await client
        .from('test_cases')
        .select('id, problem_id, input, expected_output, is_public')
        .eq('problem_id', problem.id)
        .eq('is_public', true)
        .order('id', { ascending: true });

      const publicTests = (tests ?? []).map((row, index): PublicTestCase => {
        const typed = row as unknown as TestCaseRow;
        const input = typed.input as { args?: unknown[] } | unknown[];
        const args = Array.isArray(input) ? input : (input?.args ?? []);
        return { index, args, expected: typed.expected_output };
      });

      return { ...problem, publicTests };
    }
  }

  const seed = SEED_PROBLEMS.find((p) => p.id === idOrSlug || p.leetcodeSlug === idOrSlug);
  if (!seed) return null;

  return problemDetailSchema.parse({
    ...seedToProblem(seed),
    publicTests: seed.publicTests,
  });
}

export async function listTestCases(problemId: string): Promise<PublicTestCase[]> {
  const detail = await getProblem(problemId);
  return detail?.publicTests ?? [];
}

export interface RoadmapSection {
  category: string;
  problems: Problem[];
}

export async function getRoadmap(): Promise<RoadmapSection[]> {
  const problems = await listProblems();
  const seeded = new Map(SEED_PROBLEMS.map((p) => [p.id, p]));
  const decorated = problems.map((p) => ({ ...p, publicTests: seeded.get(p.id)?.publicTests ?? [] }));
  return groupProblemsByCategory(decorated as SeedProblem[]).map((group) => ({
    category: group.category,
    problems: group.problems.map(({ publicTests: _tests, ...problem }) => problem),
  }));
}

/**
 * Server-only: seed the `problems` and public `test_cases` tables via the
 * service-role client. Invoked by `scripts/seed.ts` or the /api/dev/seed route.
 */
export async function seedDatabase(): Promise<{ problems: number; testCases: number }> {
  const admin = createAdminClient();
  if (!admin) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');

  let problemCount = 0;
  let testCount = 0;

  for (const seed of SEED_PROBLEMS) {
    const row = {
      id: seed.id,
      leetcode_slug: seed.leetcodeSlug,
      title: seed.title,
      difficulty: seed.difficulty,
      category: seed.category,
      pattern: seed.pattern,
      neetcode_order: seed.neetcodeOrder,
      leetcode_url: seed.leetcodeUrl,
      summary: seed.summary,
      tags: seed.tags,
      entry_function: seed.entryFunction,
    };
    const { error } = await admin.from('problems').upsert(row, { onConflict: 'id' });
    if (error) throw new Error(`Seed failed for ${seed.id}: ${error.message}`);
    problemCount += 1;

    // Replace public tests deterministically.
    await admin.from('test_cases').delete().eq('problem_id', seed.id).eq('is_public', true);
    const testRows = seed.publicTests.map((test) => ({
      id: `${seed.id}--public--${test.index}`,
      problem_id: seed.id,
      input: { args: test.args },
      expected_output: test.expected,
      is_public: true,
    }));
    if (testRows.length > 0) {
      const { error: testError } = await admin.from('test_cases').upsert(testRows, { onConflict: 'id' });
      if (testError) throw new Error(`Test seed failed for ${seed.id}: ${testError.message}`);
      testCount += testRows.length;
    }
  }

  return { problems: problemCount, testCases: testCount };
}