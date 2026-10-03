import type { Difficulty, Problem } from '@/types/problem';
import { SOLVED_STATUSES, type LearningStatus } from '@/types/progress';

/**
 * Pure filtering logic for the problem browser.
 *
 * Deliberately free of any server-only import (no `server-only` Supabase
 * client, no `next/headers`) so it can run in the browser *and* be unit-tested
 * directly. Server-side data loading lives in `browser-data.ts`.
 */

export type StatusFilter = 'ALL' | 'UNSOLVED' | 'ATTEMPTED' | 'SOLVED' | 'REVIEW';

export interface BrowserProblem extends Problem {
  learningStatus: LearningStatus;
  /** Whether an external platform (LeetCode) reports the problem as solved. */
  externalSolved: boolean;
  needsReview: boolean;
}

export interface BrowserSection {
  category: string;
  problems: BrowserProblem[];
}

export interface BrowserFilters {
  category: string | null;
  pattern: string | null;
  difficulty: Difficulty | null;
  status: StatusFilter;
  query: string;
}

export const NO_FILTERS: BrowserFilters = {
  category: null,
  pattern: null,
  difficulty: null,
  status: 'ALL',
  query: '',
};

export function matchesStatusFilter(problem: BrowserProblem, filter: StatusFilter): boolean {
  switch (filter) {
    case 'UNSOLVED':
      return !SOLVED_STATUSES.includes(problem.learningStatus);
    case 'ATTEMPTED':
      return problem.learningStatus === 'ATTEMPTED';
    case 'SOLVED':
      return SOLVED_STATUSES.includes(problem.learningStatus);
    case 'REVIEW':
      return problem.needsReview;
    case 'ALL':
    default:
      return true;
  }
}

/**
 * Filtering runs client-side over a small dataset (the seed is ~14 problems and
 * the full roadmap is ~150), which keeps the browser instant and works offline
 * once the payload is cached.
 */
export function applyFilters(sections: BrowserSection[], filters: BrowserFilters): BrowserSection[] {
  const query = filters.query.trim().toLowerCase();

  return sections
    .filter((section) => !filters.category || section.category === filters.category)
    .map((section) => ({
      category: section.category,
      problems: section.problems.filter((problem) => {
        if (filters.pattern && problem.pattern !== filters.pattern) return false;
        if (filters.difficulty && problem.difficulty !== filters.difficulty) return false;
        if (!matchesStatusFilter(problem, filters.status)) return false;
        if (query) {
          const haystack = `${problem.title} ${problem.pattern} ${problem.category} ${problem.tags.join(' ')}`;
          if (!haystack.toLowerCase().includes(query)) return false;
        }
        return true;
      }),
    }))
    // Drop sections that no longer contain any visible problems.
    .filter((section) => section.problems.length > 0);
}

export function countProblems(sections: BrowserSection[]): number {
  return sections.reduce((sum, section) => sum + section.problems.length, 0);
}