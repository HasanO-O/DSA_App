import 'server-only';

import { getRoadmap } from '@/lib/problems/repository';
import { loadProgressMap } from '@/features/progress/progress-service';
import type { Difficulty } from '@/types/problem';
import type { BrowserProblem, BrowserSection } from './filters';

/**
 * Server-side loader for the problem browser.
 *
 * Kept separate from `filters.ts` (which is pure and browser-safe) because this
 * module reaches for the Supabase server client, which is marked `server-only`.
 */
export interface ProblemBrowserData {
  sections: BrowserSection[];
  categories: string[];
  patterns: string[];
  difficulties: Difficulty[];
  total: number;
}

export async function loadBrowserData(): Promise<ProblemBrowserData> {
  const [sections, progress] = await Promise.all([getRoadmap(), loadProgressMap()]);

  const decorated: BrowserSection[] = sections.map((section) => ({
    category: section.category,
    problems: section.problems.map((problem) => {
      const entry = progress[problem.id];
      const learningStatus = entry?.learningStatus ?? 'NOT_STARTED';
      return {
        ...problem,
        learningStatus,
        externalSolved: entry?.externalStatus === 'SOLVED' || entry?.externalStatus === 'ACCEPTED',
        needsReview: learningStatus === 'NEEDS_REVIEW',
      } satisfies BrowserProblem;
    }),
  }));

  const all = decorated.flatMap((section) => section.problems);
  const unique = <T,>(values: T[]): T[] => [...new Set(values)];

  return {
    sections: decorated,
    categories: unique(all.map((p) => p.category)).sort(),
    patterns: unique(all.map((p) => p.pattern)).sort(),
    difficulties: ['EASY', 'MEDIUM', 'HARD'],
    total: all.length,
  };
}