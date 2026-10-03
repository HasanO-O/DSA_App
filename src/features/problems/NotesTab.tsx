'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SaveStatus } from '@/components/ui/SaveStatus';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getDb } from '@/lib/db/dexie';
import { newId } from '@/utils/id';
import type { Note } from '@/types/submission';
import type { Problem } from '@/types/problem';

const AUTOSAVE_DELAY_MS = 800;

/**
 * Free-form notes attached to a problem (spec §7/§26).
 *
 * Written straight to IndexedDB on a debounce so notes survive an offline
 * session or an immediate app kill.
 */
export function NotesTab({ problem }: { problem: Problem }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const online = useOnlineStatus();

  const noteIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const db = getDb();
      const existing = await db.notes.where('problemId').equals(problem.id).first();
      if (cancelled) return;
      noteIdRef.current = existing?.id ?? null;
      setBody(existing?.body ?? '');
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [problem.id]);

  const handleChange = useCallback(
    (next: string) => {
      setBody(next);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setSaving(true);
        const db = getDb();
        const now = new Date().toISOString();
        const note: Note = {
          id: noteIdRef.current ?? newId(),
          problemId: problem.id,
          body: next,
          updatedAt: now,
        };
        noteIdRef.current = note.id;
        await db.notes.put(note);
        setSaving(false);
      }, AUTOSAVE_DELAY_MS);
    },
    [problem.id],
  );

  if (loading) {
    return <div className="py-16 text-center text-sm text-ink-muted">Loading notes…</div>;
  }

  return (
    <div className="flex flex-col pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Notes</h2>
        <SaveStatus state={{ online, syncing: saving, pending: 0 }} />
      </div>

      <textarea
        aria-label={`Notes for ${problem.title}`}
        value={body}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="What tripped you up? What finally clicked?"
        className="min-h-64 w-full resize-y rounded-2xl border border-line bg-surface p-3 text-base leading-relaxed placeholder:text-ink-muted focus:border-brand focus:outline-none"
      />

      <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
        Notes autosave locally and sync when you reconnect. They also give the AI assistant
        (later phase) the right context to explain or debug.
      </p>
    </div>
  );
}