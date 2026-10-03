'use client';

import { cn } from '@/utils/cn';

export interface SyncState {
  online: boolean;
  /** Number of local changes waiting to be flushed. */
  pending: number;
  syncing: boolean;
}

/**
 * Compact connectivity + sync status pill.
 *
 * Shows `Saved`, `Offline`, or `Syncing` instead of asking the user to save
 * manually (spec §32). Phase 6 wires the pending count to the real sync queue.
 */
export function SaveStatus({ state, className }: { state: SyncState; className?: string }) {
  const { online, syncing, pending } = state;

  const label = !online ? 'Offline' : syncing ? 'Syncing' : pending > 0 ? 'Saved' : 'Saved';
  const dot = !online ? 'bg-medium' : syncing ? 'bg-brand' : pending > 0 ? 'bg-review' : 'bg-easy';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-1 text-[11px] font-medium text-ink-muted',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
}