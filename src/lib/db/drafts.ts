'use client';

import { getDb } from '@/lib/db/dexie';
import type { CodeDraft, Language } from '@/types/submission';

const draftId = (problemId: string, language: Language) => `${problemId}::${language}`;

/**
 * Draft access layer (spec §12).
 *
 * Writes always go to IndexedDB first so a keystroke survives an instant app
 * kill. `version` is a monotonic counter used by the sync layer so an older
 * server copy can never overwrite newer local work.
 */
export async function saveDraftLocal(
  problemId: string,
  language: Language,
  code: string,
): Promise<CodeDraft> {
  const db = getDb();
  const id = draftId(problemId, language);
  const existing = await db.drafts.get(id);

  const draft: CodeDraft = {
    id,
    userId: 'local',
    problemId,
    language,
    code,
    version: (existing?.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  await db.drafts.put(draft);
  return draft;
}

export async function loadDraftLocal(
  problemId: string,
  language: Language,
): Promise<CodeDraft | undefined> {
  return getDb().drafts.get(draftId(problemId, language));
}

export async function loadAllDraftsLocal(problemId: string): Promise<CodeDraft[]> {
  return getDb().drafts.where('problemId').equals(problemId).toArray();
}

/**
 * Server draft merge (spec §12): last-write-wins, but only when the server copy
 * is genuinely newer. Local unsynced work is never discarded.
 */
export function mergeDraft(local: CodeDraft | undefined, remote: CodeDraft | undefined) {
  if (!local) return remote;
  if (!remote) return local;
  return remote.version > local.version ? remote : local;
}