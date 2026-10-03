'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { ProblemTab } from './ProblemTab';
import { VisualizationTab } from '@/features/visualization/VisualizationTab';
import { CodeTab } from './CodeTab';
import { NotesTab } from './NotesTab';
import { PlaceholderTab } from './PlaceholderTab';
import { cn } from '@/utils/cn';
import type { LearningStatus } from '@/types/progress';
import type { PublicTestCase } from '@/types/problem';
import type { Problem } from '@/types/problem';

export type WorkspaceTab = 'problem' | 'visualize' | 'code' | 'notes' | 'hints' | 'submissions' | 'ai';

const PRIMARY_TABS: { value: WorkspaceTab; label: string; glyph: string }[] = [
  { value: 'problem', label: 'Problem', glyph: '☰' },
  { value: 'visualize', label: 'Visualize', glyph: '✎' },
  { value: 'code', label: 'Code', glyph: '⌨' },
  { value: 'notes', label: 'Notes', glyph: '✐' },
];

/**
 * One persistent workspace per problem (spec §7). Primary work stays on four
 * tabs; secondary panels open as an overlay so the user never has to move
 * through several pages to go from a diagram to code.
 */
export function ProblemWorkspace({
  problem,
  publicTests,
  initialStatus,
}: {
  problem: Problem;
  publicTests: PublicTestCase[];
  initialStatus: LearningStatus;
}) {
  const [tab, setTab] = useState<WorkspaceTab>('problem');
  const [status, setStatus] = useState<LearningStatus>(initialStatus);
  const [overlay, setOverlay] = useState<WorkspaceTab | null>(null);

  const openOverlay = (next: WorkspaceTab) => setOverlay(next);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Tabs
        ariaLabel="Problem workspace sections"
        items={PRIMARY_TABS}
        value={tab}
        onChange={(value) => {
          setOverlay(null);
          setTab(value);
        }}
        className="sticky top-14 z-20 bg-canvas/95 backdrop-blur-sm"
      />

      <div className="min-h-0 flex-1">
        {tab === 'problem' ? (
          <ProblemTab
            problem={problem}
            status={status}
            publicTests={publicTests}
            onOpenTab={openOverlay}
          />
        ) : null}
        {tab === 'visualize' ? <VisualizationTab problem={problem} /> : null}
        {tab === 'code' ? <CodeTab problem={problem} status={status} onStatusChange={setStatus} /> : null}
        {tab === 'notes' ? <NotesTab problem={problem} /> : null}
      </div>

      {overlay ? (
        <OverlayPanel title={overlayTitle(overlay)} onClose={() => setOverlay(null)}>
          {overlay === 'hints' ? <PlaceholderTab feature="Hints" problem={problem} /> : null}
          {overlay === 'submissions' ? <PlaceholderTab feature="Submission history" problem={problem} /> : null}
          {overlay === 'ai' ? <PlaceholderTab feature="AI assistance" problem={problem} /> : null}
        </OverlayPanel>
      ) : null}
    </div>
  );
}

function overlayTitle(overlay: WorkspaceTab): string {
  switch (overlay) {
    case 'hints':
      return 'Hints';
    case 'submissions':
      return 'Submissions';
    case 'ai':
      return 'AI';
    default:
      return 'More';
  }
}

function OverlayPanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas/98 backdrop-blur-sm">
      <div className="flex min-h-14 items-center gap-2 border-b border-line px-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="-ml-1 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-lg text-ink-muted active:bg-surface-2"
        >
          <span aria-hidden>×</span>
        </button>
        <h2 className="flex-1 text-base font-semibold">{title}</h2>
      </div>
      <div className={cn('flex-1 overflow-y-auto px-4 py-4')}>{children}</div>
    </div>
  );
}