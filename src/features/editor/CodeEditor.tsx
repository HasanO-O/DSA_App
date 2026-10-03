'use client';

import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  undo as undoCommand,
  redo as redoCommand,
} from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches, search } from '@codemirror/search';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import {
  bracketMatching,
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language';
import { languages as languageDescriptions } from '@codemirror/language-data';
import type { Language } from '@/types/submission';

const theme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: 'var(--color-ink)', height: '100%' },
  '.cm-content': { padding: '10px 0', caretColor: 'var(--color-brand)' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--color-ink-muted)',
    border: 'none',
    minWidth: '38px',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in oklab, var(--color-surface-2) 70%, transparent)',
  },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'color-mix(in oklab, var(--color-brand) 28%, transparent)',
  },
  '&.cm-focused': { outline: 'none' },
});

const cmLanguage = (language: Language) => (language === 'cpp' ? 'cpp' : language);

function undo(view: EditorView | null) {
  if (view) undoCommand(view);
}

function redo(view: EditorView | null) {
  if (view) redoCommand(view);
}

/**
 * Returns the grammar extension for a language, or an empty extension if unknown.
 *
 * CodeMirror 6 cannot swap an extension set asynchronously, so a grammar that is
 * not bundled with the editor cannot be injected later without reconfiguring the
 * whole state. `@codemirror/language-data` grammars *are* bundled, and
 * `LanguageDescription.load()` resolves from cache without a network round trip,
 * so we load synchronously-by-await before the view is constructed. That keeps
 * highlighting correct at first paint instead of flashing unstyled code.
 */
async function resolveLanguageExtension(language: Language): Promise<Extension> {
  const name = cmLanguage(language);
  const description = languageDescriptions.find(
    (candidate) => candidate.name === name || candidate.alias.includes(name),
  );
  if (!description) return [];
  const support = await description.load();
  return support;
}

async function baseExtensions(
  language: Language,
  onChange: (value: string) => void,
): Promise<Extension[]> {
  return [
    lineNumbers(),
    highlightActiveLine(),
    drawSelection(),
    history(),
    foldGutter(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    search({ top: true }),
    highlightSelectionMatches(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    await resolveLanguageExtension(language),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) onChange(update.state.doc.toString());
    }),
    theme,
  ];
}

/** Imperative surface used by the mobile symbol toolbar. */
export interface CodeEditorHandle {
  /** Inserts text at the cursor as a single undoable step. */
  insert: (text: string) => void;
  focus: () => void;
  undo: () => void;
  redo: () => void;
}

/**
 * CodeMirror 6 wrapper (spec §11).
 *
 * Mounted imperatively because CodeMirror owns its DOM. The document lives in
 * CodeMirror's state and is pushed outward only via `onChange`, so undo history
 * survives re-renders and language switches.
 */
export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  { value, language, onChange, readOnly },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  useImperativeHandle(
    ref,
    () => ({
      insert: (text: string) => {
        const view = viewRef.current;
        if (!view) return;
        const { from, to } = view.state.selection.main;
        view.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
          // Keep the change separate from surrounding typing in the undo history.
          userEvent: 'input.type.compose',
        });
        view.focus();
      },
      focus: () => viewRef.current?.focus(),
      undo: () => undo(viewRef.current),
      redo: () => redo(viewRef.current),
    }),
    [],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let view: EditorView | null = null;

    void (async () => {
      const extensions = await baseExtensions(language, (next) => onChangeRef.current(next));
      if (readOnly) extensions.push(EditorState.readOnly.of(true));

      // The grammar resolves asynchronously; bail out if the editor unmounted or
      // the language changed while we were waiting.
      if (cancelled) return;

      view = new EditorView({
        state: EditorState.create({ doc: valueRef.current, extensions }),
        parent: host,
      });
      viewRef.current = view;
    })();

    return () => {
      cancelled = true;
      view?.destroy();
      viewRef.current = null;
    };
    // Recreating the view on every `value` change would destroy the undo history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  return (
    <div ref={hostRef} className="h-full min-h-0 w-full overflow-hidden" data-testid="code-editor" />
  );
});

export interface CodeEditorProps {
  value: string;
  language: Language;
  onChange: (value: string) => void;
  readOnly?: boolean;
}