import type { Metadata } from 'next';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { EmptyState } from '@/components/ui/Card';
import { ProblemList } from '@/features/problems/ProblemList';
import { loadBrowserData } from '@/features/problems/browser-data';
import { learningStatusLabels } from '@/types/progress';

export const metadata: Metadata = { title: 'Review' };

/**
 * Review queue (spec §17). V1 is deterministic: a problem lands here when it was
 * solved with hints, needed several failed attempts, or was explicitly marked.
 */
export default async function ReviewPage() {
  const data = await loadBrowserData();

  const needsReview = data.sections
    .map((section) => ({
      category: section.category,
      problems: section.problems.filter((problem) => problem.needsReview),
    }))
    .filter((section) => section.problems.length > 0);

  const total = needsReview.reduce((sum, section) => sum + section.problems.length, 0);

  return (
    <Shell title="Review" withNav={false}>
      {total === 0 ? (
        <EmptyState
          title="Nothing needs review"
          description="Problems appear here after being solved with hints or after repeated failed attempts."
          action={
            <Link
              href="/problems"
              className="inline-flex min-h-11 items-center rounded-xl bg-brand px-4 text-sm font-medium text-white"
            >
              Browse problems
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            {total} problem{total === 1 ? '' : 's'} marked{' '}
            {learningStatusLabels.NEEDS_REVIEW.toLowerCase()}. Re-solve them without hints to
            promote them to mastered.
          </p>
          <ProblemList sections={needsReview} />
        </div>
      )}
    </Shell>
  );
}