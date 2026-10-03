'use client';

import { Card, SectionHeading } from '@/components/ui/Card';
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { learningStatusLabels, SOLVED_STATUSES } from '@/types/progress';
import type { LearningStatus } from '@/types/progress';
import type { Problem, PublicTestCase } from '@/types/problem';
import { getLanguage } from '@/types/submission';

export function ProblemTab({
  problem,
  status,
  publicTests = [],
  onOpenTab,
}: {
  problem: Problem;
  status: LearningStatus;
  publicTests?: PublicTestCase[];
  onOpenTab?: (tab: 'hints' | 'submissions' | 'ai') => void;
}) {
  const solvedLocally = SOLVED_STATUSES.includes(status);

  return (
    <div className="space-y-5 pt-4">
      <div>
        <div className="flex items-start gap-2">
          <h2 className="min-w-0 flex-1 text-xl font-semibold">{problem.title}</h2>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge tone="brand">{problem.category}</Badge>
          <Badge>{problem.pattern}</Badge>
          {problem.tags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
      </div>

      <Card>
        <SectionHeading
          title="Overview"
          action={
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-brand"
            >
              Full statement ↗
            </a>
          }
        />
        <p className="text-sm leading-relaxed text-ink">{problem.summary}</p>
        <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-xs text-ink-muted">
          This summary is written for the app. The complete problem statement, examples and
          discussions live on LeetCode.
        </p>
      </Card>

      {publicTests.length > 0 ? (
        <Card>
          <SectionHeading title={`Public examples (${publicTests.length})`} />
          <ul className="space-y-3">
            {publicTests.map((test) => (
              <li key={test.index} className="rounded-xl bg-surface-2 px-3 py-2">
                <p className="text-xs font-semibold text-ink-muted">Example {test.index + 1}</p>
                <pre className="mt-1 overflow-x-auto text-xs">
                  <code>{`input:  ${formatValue(test.args)}`}</code>
                </pre>
                <pre className="mt-0.5 overflow-x-auto text-xs">
                  <code>{`output: ${formatValue([test.expected])}`}</code>
                </pre>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-muted">
            Hidden test cases run on the server and are never sent to this device.
          </p>
        </Card>
      ) : null}

      <Card>
        <SectionHeading title="Learning status" />
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status === 'NEEDS_REVIEW' ? 'review' : 'brand'}>
            {learningStatusLabels[status]}
          </Badge>
          {solvedLocally ? <Badge tone="easy">Solved here</Badge> : null}
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          LeetCode&apos;s solved flag and your learning status are tracked separately — solving with
          hints still means you have not mastered it.
        </p>
        {onOpenTab ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <SecondaryButton onClick={() => onOpenTab('hints')}>Hints</SecondaryButton>
            <SecondaryButton onClick={() => onOpenTab('submissions')}>History</SecondaryButton>
            <SecondaryButton onClick={() => onOpenTab('ai')}>AI</SecondaryButton>
          </div>
        ) : null}
      </Card>

      <Card>
        <SectionHeading title="Entry function" />
        <p className="text-sm text-ink-muted">
          Implement{' '}
          <code className="rounded bg-surface-2 px-1 py-0.5 text-xs text-ink">
            {problem.entryFunction}
          </code>{' '}
          — it will be called with the test arguments when you run your code.
        </p>
        <pre className="mt-2 overflow-x-auto rounded-xl bg-surface-2 px-3 py-2 text-xs text-ink-muted">
          <code>{getLanguage('python')?.starterCode.trim()}</code>
        </pre>
      </Card>

      <a
        href={problem.leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-13 items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 text-sm font-medium"
      >
        Open on LeetCode <span aria-hidden>↗</span>
      </a>
    </div>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-xl border border-line bg-surface-2 text-sm font-medium active:bg-line"
    >
      {children}
    </button>
  );
}

function formatValue(value: unknown): string {
  try {
    const json = JSON.stringify(value);
    return json.length > 160 ? `${json.slice(0, 159)}…` : json;
  } catch {
    return String(value);
  }
}