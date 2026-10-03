'use client';

import Dexie, { type EntityTable } from 'dexie';
import type { CodeDraft, Note } from '@/types/submission';
import type { LearningStatus } from '@/types/progress';
import type { Problem } from '@/types/problem';

export interface PendingChange {
  id: string;
  opType:
    | 'CREATE_NOTE'
    | 'UPDATE_NOTE'
    | 'UPDATE_PROGRESS'
    | 'SAVE_DRAFT'
    | 'SAVE_VISUALIZATION'
    | 'CREATE_SESSION';
  payload: unknown;
  createdAt: string;
  attempts: number;
}

export interface LocalVisualization {
  id: string;
  problemId: string;
  title: string;
  sceneData: string;
  version: number;
  updatedAt: string;
}

export interface LocalProgress {
  problemId: string;
  learningStatus: LearningStatus;
  attemptCount: number;
  successfulSubmissionCount: number;
  hintsUsed: number;
  timeSpent: number;
  updatedAt: string;
}

/**
 * Local-first store. Every read path in the app prefers Dexie over the network so
 * an offline session behaves identically to an online one (spec §20).
 */
class DsaDatabase extends Dexie {
  problems!: EntityTable<Problem & { cachedAt: string }, 'id'>;
  drafts!: EntityTable<CodeDraft, 'id'>;
  notes!: EntityTable<Note, 'id'>;
  visualizations!: EntityTable<LocalVisualization, 'id'>;
  progress!: EntityTable<LocalProgress, 'problemId'>;
  syncQueue!: EntityTable<PendingChange, 'id'>;

  constructor() {
    super('dsa-app');
    this.version(1).stores({
      problems: 'id, category, neetcodeOrder',
      drafts: 'id, [problemId+language], problemId, updatedAt',
      notes: 'id, problemId, updatedAt',
      visualizations: 'id, problemId, updatedAt',
      progress: 'problemId, learningStatus',
      syncQueue: 'id, createdAt',
    });
  }
}

let db: DsaDatabase | null = null;

export function getDb(): DsaDatabase {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is not available in this environment.');
  }
  if (!db) db = new DsaDatabase();
  return db;
}

/** Test/server helper so module import never touches IndexedDB. */
export function __setDbForTests(next: DsaDatabase | null) {
  db = next;
}