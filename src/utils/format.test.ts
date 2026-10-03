import { describe, expect, it } from 'vitest';
import { formatDuration, formatRelativeTime, percent, truncate, statusGlyph } from './format';
import { leetcodeUrlForSlug, slugToTitle } from '@/types/problem';
import { newId } from './id';

describe('formatDuration', () => {
  it('formats zero and negatives as 0m', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(-10)).toBe('0m');
  });

  it('formats seconds below a minute', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('formats minutes below an hour', () => {
    expect(formatDuration(60 * 54)).toBe('54m');
  });

  it('formats whole hours', () => {
    expect(formatDuration(60 * 60 * 2)).toBe('2h');
  });

  it('formats mixed hours and minutes', () => {
    expect(formatDuration(60 * 60 * 2 + 60 * 15)).toBe('2h 15m');
  });
});

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-10-03T12:00:00Z');

  it('returns never for a missing timestamp', () => {
    expect(formatRelativeTime(null, now)).toBe('never');
    expect(formatRelativeTime(undefined, now)).toBe('never');
  });

  it('returns just now under a minute', () => {
    expect(formatRelativeTime('2026-10-03T11:59:30Z', now)).toBe('just now');
  });

  it('returns minutes, hours and days', () => {
    expect(formatRelativeTime('2026-10-03T11:30:00Z', now)).toBe('30m ago');
    expect(formatRelativeTime('2026-10-03T09:00:00Z', now)).toBe('3h ago');
    expect(formatRelativeTime('2026-10-01T12:00:00Z', now)).toBe('2d ago');
  });

  it('never returns a negative duration for future timestamps', () => {
    expect(formatRelativeTime('2026-10-03T12:30:00Z', now)).toBe('just now');
  });
});

describe('percent', () => {
  it('returns 0 when the total is zero', () => {
    expect(percent(0, 0)).toBe(0);
  });

  it('rounds to the nearest whole percent', () => {
    expect(percent(1, 3)).toBe(33);
    expect(percent(2, 3)).toBe(67);
    expect(percent(3, 3)).toBe(100);
  });
});

describe('slug helpers', () => {
  it('converts a slug to a readable title', () => {
    expect(slugToTitle('two-sum')).toBe('Two Sum');
    expect(slugToTitle('reverse-linked-list')).toBe('Reverse Linked List');
  });

  it('builds the canonical LeetCode URL', () => {
    expect(leetcodeUrlForSlug('valid-parentheses')).toBe(
      'https://leetcode.com/problems/valid-parentheses/',
    );
  });
});

describe('truncate', () => {
  it('leaves short strings alone', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('truncates with an ellipsis', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcd…');
  });
});

describe('statusGlyph', () => {
  it('has a glyph for every learning status', () => {
    const statuses = [
      'NOT_STARTED',
      'ATTEMPTED',
      'SOLVED',
      'SOLVED_WITH_HINT',
      'NEEDS_REVIEW',
      'MASTERED',
    ] as const;
    for (const status of statuses) {
      expect(statusGlyph[status]).toBeTruthy();
    }
  });
});

describe('newId', () => {
  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 500 }, () => newId()));
    expect(ids.size).toBe(500);
  });

  it('generates RFC4122-shaped ids when crypto is available', () => {
    expect(newId()).toMatch(/^[0-9a-f-]{36}$/i);
  });
});