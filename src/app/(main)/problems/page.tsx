import type { Metadata } from 'next';
import { Shell } from '@/components/layout/Shell';
import { ProblemFilters } from '@/features/problems/ProblemFilters';
import { loadBrowserData } from '@/features/problems/browser-data';

export const metadata: Metadata = { title: 'Problems' };

export default async function ProblemsPage() {
  const data = await loadBrowserData();

  return (
    <Shell title="Problems" withNav={false}>
      <p className="mb-4 text-sm text-ink-muted">
        Follow the NeetCode roadmap in order, or filter by pattern and difficulty.
      </p>
      <ProblemFilters data={data} />
    </Shell>
  );
}