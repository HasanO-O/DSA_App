import { describe, expect, it } from 'vitest';
import {
  applyFilters,
  countProblems,
  matchesStatusFilter,
  NO_FILTERS,
  type BrowserProblem,
  type BrowserSection,
} from './filters';
import type { Problem } from '@/types/problem';

function makeProblem(overrides: Partial<BrowserProblem> = {}): BrowserProblem {
  const base: Problem = {
    id: 'two-sum',
    leetcodeSlug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'EASY',
    category: 'Arrays & Hashing',
    pattern: 'Hash Map',
    neetcodeOrder: 1,
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    summary: '',
    tags: ['array'],
    entryFunction: 'twoSum',
  };
  return {
    ...base,
    learningStatus: 'NOT_STARTED',
    externalSolved: false,
    needsReview: false,
    ...overrides,
  };
}

const sections: BrowserSection[] = [
  {
    category: 'Arrays & Hashing',
    problems: [
      makeProblem(),
      makeProblem({
        id: 'valid-anagram',
        leetcodeSlug: 'valid-anagram',
        title: 'Valid Anagram',
        learningStatus: 'SOLVED',
      }),
    ],
  },
  {
    category: 'Stack',
    problems: [
      makeProblem({
        id: 'valid-parentheses',
        leetcodeSlug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'EASY',
        pattern: 'Stack',
        learningStatus: 'NEEDS_REVIEW',
        needsReview: true,
      }),
    ],
  },
];

describe('matchesStatusFilter', () => {
  it('ALL matches everything', () => {
    expect(matchesStatusFilter(makeProblem(), 'ALL')).toBe(true);
    expect(matchesStatusFilter(makeProblem({ learningStatus: 'MASTERED' }), 'ALL')).toBe(true);
  });

  it('UNSOLVED excludes all solved variants', () => {
    expect(matchesStatusFilter(makeProblem(), 'UNSOLVED')).toBe(true);
    expect(matchesStatusFilter(makeProblem({ learningStatus: 'SOLVED' }), 'UNSOLVED')).toBe(false);
    expect(matchesStatusFilter(makeProblem({ learningStatus: 'MASTERED' }), 'UNSOLVED')).toBe(false);
  });

  it('REVIEW only matches needs-review problems', () => {
    expect(matchesStatusFilter(makeProblem({ needsReview: true }), 'REVIEW')).toBe(true);
    expect(matchesStatusFilter(makeProblem(), 'REVIEW')).toBe(false);
  });
});

describe('applyFilters', () => {
  const noFilters = NO_FILTERS;

  it('returns all sections with no filters', () => {
    const result = applyFilters(sections, noFilters);
    expect(countProblems(result)).toBe(3);
  });

  it('filters by category', () => {
    const result = applyFilters(sections, { ...noFilters, category: 'Stack' });
    expect(result).toHaveLength(1);
    expect(result[0]?.category).toBe('Stack');
  });

  it('filters by pattern', () => {
    const result = applyFilters(sections, { ...noFilters, pattern: 'Stack' });
    expect(result).toHaveLength(1);
    expect(result[0]?.problems[0]?.id).toBe('valid-parentheses');
  });

  it('filters by difficulty', () => {
    const result = applyFilters(sections, { ...noFilters, difficulty: 'HARD' });
    expect(result).toHaveLength(0);
  });

  it('filters by status', () => {
    const solved = applyFilters(sections, { ...noFilters, status: 'SOLVED' });
    expect(countProblems(solved)).toBe(1);
    expect(solved[0]?.problems[0]?.title).toBe('Valid Anagram');
  });

  it('countProblems totals across sections', () => {
    expect(countProblems(sections)).toBe(3);
    expect(countProblems([])).toBe(0);
  });

  it('searches title, pattern, category and tags', () => {
    expect(applyFilters(sections, { ...noFilters, query: 'parenthe' })).toHaveLength(1);
    expect(applyFilters(sections, { ...noFilters, query: 'anagram' })[0]?.problems).toHaveLength(1);
    expect(applyFilters(sections, { ...noFilters, query: 'zzzzz' })).toHaveLength(0);
  });

  it('drops empty sections', () => {
    const result = applyFilters(sections, { ...noFilters, category: 'Stack', pattern: 'Hash Map' });
    expect(result).toHaveLength(0);
  });
});