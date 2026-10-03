import { z } from 'zod';

export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const CATEGORIES = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  '1-D DP',
  '2-D DP',
  'Advanced DP',
  'Greedy',
  'Intervals',
  'Bit Manipulation',
  'Math & Geometry',
  'Strings',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PATTERNS = [
  'Array',
  'Hash Map',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Tree',
  'Heap',
  'Graph',
  'Dynamic Programming',
  'Trie',
  'Backtracking',
] as const;
export type Pattern = (typeof PATTERNS)[number];

export const difficultySchema = z.enum(DIFFICULTIES);
export const categorySchema = z.enum(CATEGORIES);
export const patternSchema = z.enum(PATTERNS);

export const problemSchema = z.object({
  id: z.string().min(1),
  leetcodeSlug: z.string().min(1),
  title: z.string().min(1),
  difficulty: difficultySchema,
  category: categorySchema,
  pattern: patternSchema,
  neetcodeOrder: z.number().int().nonnegative(),
  leetcodeUrl: z.string().url(),
  /** Short, original summary written for this app. Never copied problem statements. */
  summary: z.string().default(''),
  tags: z.array(z.string()).default([]),
  /** Name of the function the user must implement, used by the judge harness. */
  entryFunction: z.string().default('solve'),
  /** Ordered NeetCode pattern slots; mirrors the roadmap ordering. */
  createdAt: z.string().optional(),
});

export type Problem = z.infer<typeof problemSchema>;

export interface PublicTestCase {
  index: number;
  /** Positional arguments for the entry function. */
  args: unknown[];
  expected: unknown;
}

export const publicTestCaseSchema = z
  .object({
    index: z.number().int().nonnegative(),
    args: z.array(z.unknown()),
    // A problem can legitimately expect `undefined`, so the key must be *present*
    // rather than merely allowed. `z.unknown()` alone is optional in Zod's inferred
    // output; `.transform` re-projects to the declared contract so `expected` is
    // required on the parsed type as well as on the interface.
    expected: z.unknown(),
  })
  .transform(
    (test): PublicTestCase => ({ index: test.index, args: test.args, expected: test.expected }),
  );

export const problemDetailSchema = problemSchema.extend({
  publicTests: z.array(publicTestCaseSchema).default([]),
});
export type ProblemDetail = z.infer<typeof problemDetailSchema>;

/** `two-sum` -> `Two Sum`, used for readable route segments when no title exists. */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function leetcodeUrlForSlug(slug: string): string {
  return `https://leetcode.com/problems/${slug}/`;
}