'use client';

import Link from 'next/link';
import { DifficultyBadge, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/utils/cn';
import { learningStatusLabels, SOLVED_STATUSES } from '@/types/progress';
import type { BrowserProblem, BrowserSection } from './filters';

const glyphFor = (problem: BrowserProblem) => {
  if (problem.learningStatus === 'NEEDS_REVIEW') return '↻';
  if (problem.learningStatus === 'MASTERED') return '★';
  if (SOLVED_STATUSES.includes(problem.learningStatus)) return '✓';
  if (problem.learningStatus === 'ATTEMPTED') return '◐';
  return '○';
};

const glyphTone = (problem: BrowserProblem) => {
  if (problem.learningStatus === 'NEEDS_REVIEW') return 'text-review';
  if (problem.learningStatus === 'MASTERED') return 'text-brand';
  if (SOLVED_STATUSES.includes(problem.learningStatus)) return 'text-easy';
  if (problem.learningStatus === 'ATTEMPTED') return 'text-medium';
  return 'text-ink-muted';
};

export function ProblemList({ sections }: { sections: BrowserSection[] }) {
  if (sections.length === 0) {
    return (
      <EmptyState
        title="No problems match these filters"
        description="Try widening the category, pattern or difficulty."
      />
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((section) => {
        const solved = section.problems.filter((p) =>
          SOLVED_STATUSES.includes(p.learningStatus),
        ).length;

        return (
          <section key={section.category}>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-sm font-semibold">{section.category}</h2>
              <span className="text-xs tabular-nums text-ink-muted">
                {solved}/{section.problems.length}
              </span>
              <ProgressBar
                className="ml-auto w-16"
                value={solved}
                max={section.problems.length}
                tone="easy"
                label={`${section.category} progress`}
              />
            </div>

            <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
              {section.problems.map((problem, index) => (
                <li key={problem.id} className={cn(index > 0 && 'border-t border-line')}>
                  <Link
                    href={`/problems/${problem.leetcodeSlug}`}
                    className="flex min-h-14 items-center gap-3 px-3 py-3 active:bg-surface-2"
                  >
                    <span
                      aria-hidden
                      className={cn('w-4 shrink-0 text-center text-sm', glyphTone(problem))}
                    >
                      {glyphFor(problem)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{problem.title}</span>
                      <span className="block truncate text-xs text-ink-muted">
                        {problem.pattern}
                        {problem.learningStatus !== 'NOT_STARTED'
                          ? ` · ${learningStatusLabels[problem.learningStatus]}`
                          : ''}
                      </span>
                    </span>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}