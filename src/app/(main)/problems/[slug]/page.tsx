import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { DifficultyBadge, Badge } from '@/components/ui/Badge';
import { ProblemWorkspace } from '@/features/problems/ProblemWorkspace';
import { getProblem } from '@/lib/problems/repository';
import { loadProgressMap } from '@/features/progress/progress-service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const problem = await getProblem(slug);
  return { title: problem?.title ?? 'Problem' };
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [problem, progress] = await Promise.all([getProblem(slug), loadProgressMap()]);

  if (!problem) notFound();

  const initialStatus = progress[problem.id]?.learningStatus ?? 'NOT_STARTED';

  return (
    <Shell
      title={problem.title}
      back={{ href: '/problems', label: 'Back to problems' }}
      headerRight={
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge>{problem.pattern}</Badge>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
      }
      className="flex flex-col"
    >
      <ProblemWorkspace
        problem={problem}
        publicTests={problem.publicTests}
        initialStatus={initialStatus}
      />
    </Shell>
  );
}