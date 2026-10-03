import { describe, expect, it } from 'vitest';
import {
  SEED_PROBLEMS,
  groupProblemsByCategory,
  SEED_CATEGORY_ORDER,
} from '@/lib/problems/seed';
import { leetcodeUrlForSlug } from '@/types/problem';
import { problemSchema } from '@/types/problem';

describe('seed dataset', () => {
  it('contains no duplicate ids or slugs', () => {
    const ids = SEED_PROBLEMS.map((p) => p.id);
    const slugs = SEED_PROBLEMS.map((p) => p.leetcodeSlug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every problem validates against the schema', () => {
    for (const problem of SEED_PROBLEMS) {
      expect(() => problemSchema.parse(problem)).not.toThrow();
    }
  });

  it('every problem has at least one public test case', () => {
    for (const problem of SEED_PROBLEMS) {
      expect(problem.publicTests.length).toBeGreaterThan(0);
    }
  });

  it('public test indices are sequential from zero', () => {
    for (const problem of SEED_PROBLEMS) {
      problem.publicTests.forEach((test, index) => {
        expect(test.index).toBe(index);
      });
    }
  });

  it('leetcode URLs match their slug', () => {
    for (const problem of SEED_PROBLEMS) {
      expect(problem.leetcodeUrl).toBe(leetcodeUrlForSlug(problem.leetcodeSlug));
    }
  });

  it('covers every roadmap category in the seed ordering', () => {
    const categories = new Set(SEED_PROBLEMS.map((p) => p.category));
    for (const category of SEED_CATEGORY_ORDER) {
      expect(categories.has(category)).toBe(true);
    }
  });
});

describe('groupProblemsByCategory', () => {
  it('groups by category and orders within each group by neetcode order', () => {
    const groups = groupProblemsByCategory(SEED_PROBLEMS);
    expect(groups.length).toBeGreaterThan(0);

    for (const group of groups) {
      const orders = group.problems.map((p) => p.neetcodeOrder);
      const sorted = [...orders].sort((a, b) => a - b);
      expect(orders).toEqual(sorted);
    }
  });

  it('orders the groups following the roadmap sequence', () => {
    const groups = groupProblemsByCategory(SEED_PROBLEMS);
    const indices = groups.map((g) => SEED_CATEGORY_ORDER.indexOf(g.category as never));
    const sorted = [...indices].sort((a, b) => a - b);
    expect(indices).toEqual(sorted);
  });

  it('preserves every problem across groups', () => {
    const groups = groupProblemsByCategory(SEED_PROBLEMS);
    const total = groups.reduce((sum, g) => sum + g.problems.length, 0);
    expect(total).toBe(SEED_PROBLEMS.length);
  });
});