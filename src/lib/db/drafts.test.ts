import { describe, expect, it } from 'vitest';
import { mergeDraft } from '@/lib/db/drafts';
import { LANGUAGE_LIST, LANGUAGES, getLanguage } from '@/types/submission';
import type { CodeDraft } from '@/types/submission';

function draft(version: number, code: string): CodeDraft {
  return {
    id: 'two-sum::rust',
    userId: 'u1',
    problemId: 'two-sum',
    language: 'rust',
    code,
    version,
    updatedAt: `2026-10-03T10:0${version}:00Z`,
  };
}

describe('mergeDraft', () => {
  it('returns the local draft when there is no server copy', () => {
    const local = draft(3, 'local');
    expect(mergeDraft(local, undefined)).toBe(local);
  });

  it('returns the server copy when there is no local draft', () => {
    const remote = draft(2, 'remote');
    expect(mergeDraft(undefined, remote)).toBe(remote);
  });

  it('keeps the newer local draft even when the server copy is older', () => {
    const local = draft(5, 'newer local');
    const remote = draft(2, 'stale server');
    expect(mergeDraft(local, remote)?.code).toBe('newer local');
  });

  it('adopts the server copy only when its version is strictly greater', () => {
    const local = draft(2, 'local');
    const remote = draft(7, 'newer server');
    expect(mergeDraft(local, remote)?.code).toBe('newer server');
  });

  it('keeps the local draft on a version tie', () => {
    const local = draft(4, 'local');
    const remote = draft(4, 'remote');
    expect(mergeDraft(local, remote)?.code).toBe('local');
  });
});

describe('language registry', () => {
  it('covers every declared language', () => {
    expect(LANGUAGE_LIST.map((l) => l.id).sort()).toEqual([...LANGUAGES].sort());
  });

  it('has unique Judge0 ids', () => {
    const ids = LANGUAGE_LIST.map((l) => l.judge0Id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('provides a starter code that references the entry function', () => {
    for (const language of LANGUAGE_LIST) {
      expect(language.starterCode).toMatch(/solve/);
      expect(language.starterCode.trim().length).toBeGreaterThan(0);
    }
  });

  it('looks up a language by id', () => {
    expect(getLanguage('python')?.judge0Id).toBe(71);
    expect(getLanguage('rust')?.judge0Id).toBe(73);
    expect(getLanguage('nope')).toBeUndefined();
  });
});