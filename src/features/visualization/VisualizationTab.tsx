'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw';
import type { ExcalidrawProps } from '@excalidraw/excalidraw/types';
import { SaveStatus } from '@/components/ui/SaveStatus';
import { Spinner } from '@/components/ui/Spinner';
import { getDb } from '@/lib/db/dexie';
import { newId } from '@/utils/id';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { TEMPLATES, buildTemplate, type TemplateId } from './templates';
import { cn } from '@/utils/cn';
import type { Problem } from '@/types/problem';

const AUTOSAVE_DELAY_MS = 1200;

/**
 * One shape as Excalidraw models it. Declared locally because the package ships
 * no stable types subpath export and its internals move between releases; only
 * the fields this module reads are required.
 */
interface SceneElement {
  id: string;
  type: string;
  x: number;
  y: number;
  [key: string]: unknown;
}

/** Serialized scene as stored in IndexedDB. */
interface Scene {
  elements: SceneElement[];
  appState: Record<string, unknown>;
}

/**
 * The slice of Excalidraw's imperative API we actually use.
 *
 * Declared structurally rather than imported, because the package ships no
 * stable types subpath export.
 */
interface ExcalidrawApi {
  getSceneElements: () => readonly SceneElement[];
  updateScene: (scene: { elements: readonly SceneElement[] }) => void;
  scrollToContent: (elements: readonly SceneElement[], opts?: object) => void;
}

/**
 * Scenes round-trip through IndexedDB as untyped JSON, so the stored value is
 * validated on read before it reaches the canvas. Anything that does not look
 * like an element is dropped rather than crashing the workspace.
 */
function parseScene(raw: string): Scene {
  const empty: Scene = { elements: [], appState: {} };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return empty;
  }

  if (typeof parsed !== 'object' || parsed === null) return empty;

  const candidate = parsed as { elements?: unknown; appState?: unknown };

  const elements = Array.isArray(candidate.elements)
    ? candidate.elements.filter(isSceneElement)
    : [];

  const appState =
    typeof candidate.appState === 'object' && candidate.appState !== null
      ? (candidate.appState as Record<string, unknown>)
      : {};

  return { elements, appState };
}

function isSceneElement(value: unknown): value is SceneElement {
  if (typeof value !== 'object' || value === null) return false;
  const element = value as Record<string, unknown>;
  return (
    typeof element.id === 'string' &&
    typeof element.type === 'string' &&
    typeof element.x === 'number' &&
    typeof element.y === 'number'
  );
}

/**
 * `initialData.elements` as Excalidraw declares it. Our `SceneElement` is a
 * structural subset, and scenes are validated by `parseScene` on read, so this
 * cast is the single narrow boundary where editor-owned types are accepted.
 */
type ExcalidrawInitialElements = Parameters<
  NonNullable<ExcalidrawProps['initialData']> extends infer T
    ? T extends { elements: infer E }
      ? E
      : never
    : never
>;

/**
 * Excalidraw workspace (spec §9/§32).
 *
 * The scene is stored as structured JSON (not a screenshot) so the exact drawing
 * is restored later. Autosave writes to IndexedDB on a debounce, so a diagram
 * survives leaving the tab, closing the app, or being offline.
 */
export function VisualizationTab({ problem }: { problem: Problem }) {
  const [scene, setScene] = useState<Scene>({ elements: [], appState: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const online = useOnlineStatus();

  const apiRef = useRef<ExcalidrawApi | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the most recent visualization for this problem, or start empty.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const db = getDb();
      const existing = await db.visualizations
        .where('problemId')
        .equals(problem.id)
        .reverse()
        .sortBy('updatedAt');

      if (cancelled) return;
      const latest = existing[0];

      if (latest) {
        try {
          const parsed = JSON.parse(latest.sceneData) as Scene;
          setScene({ elements: parsed.elements ?? [], appState: parsed.appState ?? {} });
          setActiveId(latest.id);
        } catch {
          setScene({ elements: [], appState: {} });
        }
      } else {
        setScene({ elements: [], appState: {} });
        setActiveId(newId());
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [problem.id]);

  const persist = useCallback(
    async (next: Scene) => {
      const db = getDb();
      const now = new Date().toISOString();
      const id = activeId ?? newId();

      await db.visualizations.put({
        id,
        problemId: problem.id,
        title: problem.title,
        sceneData: JSON.stringify(next),
        version: 1,
        updatedAt: now,
      });

      if (!activeId) setActiveId(id);
    },
    [activeId, problem.id, problem.title],
  );

  const handleChange = useCallback(
    (elements: readonly SceneElement[], appState: Record<string, unknown>) => {
      // Copy out of Excalidraw's readonly arrays: the scene is persisted as JSON
      // and must not alias editor-owned state.
      const next: Scene = { elements: [...elements], appState };
      setScene(next);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setSaving(true);
        await persist(next);
        setSaving(false);
      }, AUTOSAVE_DELAY_MS);
    },
    [persist],
  );

  const insertTemplate = useCallback((id: TemplateId) => {
    const api = apiRef.current;
    if (!api) return;

    const templateElements = buildTemplate(id);
    // `convertToExcalidrawElements` fills in the appState-derived defaults that
    // raw template objects deliberately do not carry.
    const prepared = convertToExcalidrawElements(
      templateElements as unknown as Parameters<typeof convertToExcalidrawElements>[0],
    );

    api.updateScene({
      elements: [...api.getSceneElements(), ...prepared],
    });

    api.scrollToContent(prepared);
  }, []);

  const canvasHeight = useMemo(() => 'min(60dvh, 30rem)', []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner label="Loading diagram" />
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-3">
      <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 text-xs font-medium text-ink-muted">+</span>
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => insertTemplate(template.id)}
            className="min-h-9 shrink-0 rounded-full border border-line bg-surface px-3 text-xs font-medium active:bg-surface-2"
          >
            {template.label}
          </button>
        ))}
        <span className="ml-auto shrink-0 pl-2">
          <SaveStatus state={{ online, syncing: saving, pending: 0 }} />
        </span>
      </div>

      <div
        className={cn('overflow-hidden rounded-2xl border border-line bg-surface', canvasHeight)}
        data-testid="excalidraw-canvas"
      >
        <Excalidraw
          // Remounting on problem change guarantees a clean canvas per problem.
          key={problem.id}
          excalidrawAPI={(api) => {
            apiRef.current = api as unknown as ExcalidrawApi;
          }}
          initialData={{
elements: scene.elements as ExcalidrawInitialElements,
            appState: scene.appState,
          }}
          onChange={(elements, appState) =>
            handleChange(
              elements as readonly SceneElement[],
              appState as unknown as Record<string, unknown>,
            )
          }
          gridModeEnabled={false}
          zenModeEnabled={false}
          viewModeEnabled={false}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveToActiveFile: false,
              export: false,
              toggleTheme: true,
            },
          }}
        />
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
        Diagrams autosave as structured scene data. Templates are just a starting point — every
        shape is editable, movable and deletable.
      </p>
    </div>
  );
}