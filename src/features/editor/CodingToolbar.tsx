'use client';

import { cn } from '@/utils/cn';

export interface ToolbarAction {
  /** Inserted at the cursor when the action is a symbol key. */
  insert?: string;
  /** Invoked for non-insert actions such as Undo/Redo. */
  onPress?: () => void;
  /** Short label shown on the key cap. */
  label: string;
  /** Rendered as a text key rather than a symbol key. */
  wide?: boolean;
}

/**
 * Mobile coding toolbar (spec §11/§33): the symbols that are painful to type on
 * a touch keyboard. Insertions go through the CodeMirror handle so they land at
 * the cursor and form a single undo step.
 */
export function CodingToolbar({
  actions,
  onInsert,
  onAction,
  className,
}: {
  actions: ToolbarAction[];
  onInsert: (text: string) => void;
  onAction?: (action: ToolbarAction) => void;
  className?: string;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Editor symbols"
      className={cn(
        'no-scrollbar flex gap-1 overflow-x-auto border-t border-line bg-surface px-1.5 py-1.5',
        className,
      )}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          aria-label={action.label}
          onClick={() => {
            if (action.insert) onInsert(action.insert);
            action.onPress?.();
            onAction?.(action);
          }}
          className={cn(
            'flex h-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 px-3 font-mono text-sm text-ink active:bg-line',
            action.wide && 'text-xs',
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export const SYMBOL_ACTIONS: ToolbarAction[] = [
  { label: 'Tab', insert: '  ' },
  { label: '(', insert: '(' },
  { label: ')', insert: ')' },
  { label: '{', insert: '{' },
  { label: '}', insert: '}' },
  { label: '[', insert: '[' },
  { label: ']', insert: ']' },
  { label: '=>', insert: '=>' },
  { label: ';', insert: ';' },
  { label: ':', insert: ':' },
  { label: '&', insert: '&' },
  { label: '|', insert: '|' },
  { label: '< >', insert: '<>' },
];