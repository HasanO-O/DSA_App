'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CodeEditor, type CodeEditorHandle } from '@/features/editor/CodeEditor';
import { CodingToolbar, SYMBOL_ACTIONS, type ToolbarAction } from '@/features/editor/CodingToolbar';
import { SaveStatus } from '@/components/ui/SaveStatus';
import { Spinner } from '@/components/ui/Spinner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { loadDraftLocal, saveDraftLocal } from '@/lib/db/drafts';
import { LANGUAGE_LIST, getLanguage, type Language } from '@/types/submission';
import { learningStatusLabels } from '@/types/progress';
import type { LearningStatus } from '@/types/progress';
import type { Problem } from '@/types/problem';

const AUTOSAVE_DELAY_MS = 700;

/**
 * Rewrites the generic `solve` placeholder to the problem's real entry point.
 *
 * Only call sites are rewritten (`solve(`, `fn solve(`, `def solve(` …). A naive
 * whole-word replacement also corrupts prose in starter comments, e.g.
 * `// solve the problem` would become `// twoSum the problem`.
 */
export function withEntryFunction(starterCode: string, entryFunction: string): string {
  return starterCode.replace(/\bsolve(?=\s*\()/g, entryFunction);
}

/**
 * Code workspace (spec §11/§12/§33).
 *
 * Drafts autosave to IndexedDB per `problem + language`. Execution is not wired
 * up until the Judge0 pipeline lands in Phase 4, so Run/Submit are disabled and
 * say why rather than silently failing.
 */
export function CodeTab({
  problem,
  status,
  onStatusChange,
}: {
  problem: Problem;
  status: LearningStatus;
  onStatusChange: (status: LearningStatus) => void;
}) {
  const [language, setLanguage] = useState<Language>('rust');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const online = useOnlineStatus();

  const editorRef = useRef<CodeEditorHandle>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const descriptor = useMemo(() => getLanguage(language) ?? LANGUAGE_LIST[0]!, [language]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const draft = await loadDraftLocal(problem.id, language);
      if (cancelled) return;
      setCode(draft?.code ?? withEntryFunction(descriptor.starterCode, problem.entryFunction));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [language, problem.id, problem.entryFunction, descriptor.starterCode]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleChange = useCallback(
    (next: string) => {
      setCode(next);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setSaving(true);
        await saveDraftLocal(problem.id, language, next);
        setSaving(false);
      }, AUTOSAVE_DELAY_MS);

      if (status === 'NOT_STARTED') onStatusChange('ATTEMPTED');
    },
    [language, problem.id, status, onStatusChange],
  );

  const toolbarActions = useMemo<ToolbarAction[]>(
    () => [...SYMBOL_ACTIONS, { label: 'Undo', wide: true }, { label: 'Redo', wide: true }],
    [],
  );

  const handleToolbarAction = useCallback((action: ToolbarAction) => {
    if (action.label === 'Undo') editorRef.current?.undo();
    if (action.label === 'Redo') editorRef.current?.redo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner label="Loading draft" />
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-3">
      <div className="mb-2 flex items-center gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Language</span>
          <select
            aria-label="Language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
            className="min-h-10 w-full appearance-none rounded-xl border border-line bg-surface px-3 pr-8 text-sm font-medium"
          >
            {LANGUAGE_LIST.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted"
          >
            ▾
          </span>
        </label>
        <SaveStatus state={{ online, syncing: saving, pending: 0 }} className="shrink-0" />
      </div>

      <div className="h-[min(52dvh,26rem)] overflow-hidden rounded-2xl border border-line bg-surface">
        <CodeEditor ref={editorRef} value={code} language={language} onChange={handleChange} />
      </div>

      <CodingToolbar
        actions={toolbarActions}
        onInsert={(text) => editorRef.current?.insert(text)}
        onAction={handleToolbarAction}
      />

      <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
        Drafts autosave per problem and language. Status: {learningStatusLabels[status]}. Running
        code requires the Judge0 service and arrives in a later phase.
      </p>
    </div>
  );
}
