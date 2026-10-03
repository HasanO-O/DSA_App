import Link from 'next/link';
import { Card, EmptyState, SectionHeading } from '@/components/ui/Card';
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatRelativeTime, statusGlyph } from '@/utils/format';
import { learningStatusLabels, SOLVED_STATUSES } from '@/types/progress';
import { getRoadmap } from '@/lib/problems/repository';
import { loadProgressMap } from '@/features/progress/progress-service';
import type { Problem } from '@/types/problem';
import type { ProgressMap } from '@/features/progress/progress-service';

export default async function DashboardPage() {
  const [sections, progress] = await Promise.all([getRoadmap(), loadProgressMap()]);
  const flat = sections.flatMap((s) => s.problems);

  const continueProblem =
    flat
      .filter((p) => {
        const status = progress[p.id]?.learningStatus;
        return status === 'ATTEMPTED' || status === 'NEEDS_REVIEW' || status === 'SOLVED_WITH_HINT';
      })
      .sort((a, b) => {
        const at = progress[a.id]?.updatedAt ?? '';
        const bt = progress[b.id]?.updatedAt ?? '';
        return bt.localeCompare(at);
      })[0] ?? null;

  const recommended =
    flat.find((p) => !progress[p.id]) ??
    flat.find((p) => {
      const status = progress[p.id]?.learningStatus;
      return status !== 'MASTERED' && status !== 'SOLVED';
    }) ??
    null;

  const categoryStats = sections.map((section) => {
    const solved = section.problems.filter((p) => {
      const status = progress[p.id]?.learningStatus;
      return status ? SOLVED_STATUSES.includes(status) : false;
    }).length;
    return { category: section.category, solved, total: section.problems.length };
  });

  const totalSolved = categoryStats.reduce((sum, c) => sum + c.solved, 0);
  const recent = flat
    .filter((p) => progress[p.id]?.updatedAt)
    .sort((a, b) => (progress[b.id]?.updatedAt ?? '').localeCompare(progress[a.id]?.updatedAt ?? ''))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section>
        <SectionHeading title="Today's practice" />
        <div className="space-y-3">
          {continueProblem ? (
            <ProblemTeaser label="Continue" problem={continueProblem} progress={progress} />
          ) : (
            <Card className="bg-brand-soft/60">
              <p className="text-sm font-medium">Pick up where you left off</p>
              <p className="mt-1 text-sm text-ink-muted">
                You have no problem in progress. Start with today&apos;s recommendation below.
              </p>
            </Card>
          )}
          {recommended ? (
            <ProblemTeaser
              label="Recommended next"
              problem={recommended}
              progress={progress}
              reason="Earliest unsolved problem on the NeetCode roadmap"
            />
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/commute"
          className="flex min-h-13 items-center justify-center rounded-xl bg-brand px-4 text-sm font-medium text-white"
        >
          Start Commute
        </Link>
        <Link
          href="/problems"
          className="flex min-h-13 items-center justify-center rounded-xl border border-line bg-surface-2 px-4 text-sm font-medium"
        >
          Browse roadmap
        </Link>
      </section>

      <section>
        <SectionHeading
          title={`Progress — ${totalSolved}/${flat.length} solved`}
          action={
            <Link href="/problems" className="text-xs font-medium text-brand">
              View all
            </Link>
          }
        />
        <Card className="space-y-3">
          <ProgressBar
            value={totalSolved}
            max={flat.length}
            tone="easy"
            label="Overall solved progress"
          />
          <ul className="space-y-2">
            {categoryStats.map((stat) => (
              <li key={stat.category} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-sm text-ink-muted">{stat.category}</span>
                <ProgressBar
                  className="flex-1"
                  value={stat.solved}
                  max={stat.total}
                  label={`${stat.category} progress`}
                />
                <span className="w-12 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                  {stat.solved}/{stat.total}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <SectionHeading title="Recent activity" />
        {recent.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Open a problem and your attempts will show up here."
          />
        ) : (
          <ul className="space-y-2">
            {recent.map((problem) => {
              const entry = progress[problem.id];
              return (
                <li key={problem.id}>
                  <Link
                    href={`/problems/${problem.leetcodeSlug}`}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3 active:bg-surface-2"
                  >
                    <span aria-hidden className="w-4 text-center text-ink-muted">
                      {statusGlyph[entry!.learningStatus]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{problem.title}</span>
                      <span className="block truncate text-xs text-ink-muted">
                        {learningStatusLabels[entry!.learningStatus]} ·{' '}
                        {formatRelativeTime(entry!.updatedAt)}
                      </span>
                    </span>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function ProblemTeaser({
  label,
  problem,
  progress,
  reason,
}: {
  label: string;
  problem: Problem;
  progress: ProgressMap;
  reason?: string;
}) {
  const status = progress[problem.id]?.learningStatus ?? 'NOT_STARTED';
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </div>
      <Link href={`/problems/${problem.leetcodeSlug}`} className="block px-4 pb-4 pt-2">
        <div className="flex items-start gap-2">
          <span className="min-w-0 flex-1 text-base font-semibold">{problem.title}</span>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge tone="brand">{problem.category}</Badge>
          <Badge>{problem.pattern}</Badge>
          <Badge tone={status === 'NEEDS_REVIEW' ? 'review' : 'neutral'}>
            {learningStatusLabels[status]}
          </Badge>
        </div>
        {reason ? <p className="mt-2 text-xs text-ink-muted">Why: {reason}</p> : null}
      </Link>
    </Card>
  );
}