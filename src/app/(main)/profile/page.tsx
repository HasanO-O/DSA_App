import type { Metadata } from 'next';
import { Shell } from '@/components/layout/Shell';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { signOut } from '@/app/(auth)/actions';
import { isSupabaseConfigured, isJudgeConfigured, isAiConfigured } from '@/lib/env';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getRoadmap } from '@/lib/problems/repository';
import { loadProgressMap } from '@/features/progress/progress-service';
import { SOLVED_STATUSES } from '@/types/progress';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const [sections, progress] = await Promise.all([getRoadmap(), loadProgressMap()]);
  const all = sections.flatMap((section) => section.problems);
  const solved = all.filter((problem) => {
    const status = progress[problem.id]?.learningStatus;
    return status ? SOLVED_STATUSES.includes(status) : false;
  }).length;

  const totalTime = Object.values(progress).reduce((sum, entry) => sum + entry.timeSpent, 0);
  const totalHints = Object.values(progress).reduce((sum, entry) => sum + entry.hintsUsed, 0);

  return (
    <Shell title="Profile" withNav={false}>
      <div className="space-y-6">
        <Card>
          <SectionHeading title="Your stats" />
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Solved" value={String(solved)} />
            <Stat label="Time" value={`${Math.round(totalTime / 60)}m`} />
            <Stat label="Hints" value={String(totalHints)} />
          </div>
          <ProgressBar className="mt-4" value={solved} max={all.length} tone="easy" label="Overall" />
          <p className="mt-2 text-xs text-ink-muted">
            {solved} of {all.length} problems solved with your own code.
          </p>
        </Card>

        <Card>
          <SectionHeading title="Service status" />
          <ul className="space-y-2 text-sm">
            <StatusRow label="Supabase (auth + sync)" ready={isSupabaseConfigured()} />
            <StatusRow label="Judge0 (code execution)" ready={isJudgeConfigured()} />
            <StatusRow label="OpenRouter (AI)" ready={isAiConfigured()} />
          </ul>
          <p className="mt-3 text-xs text-ink-muted">
            Judge0 and AI become available in later phases. Their keys are read server-side only.
          </p>
        </Card>

        <Card>
          <SectionHeading title="Data & privacy" />
          <ul className="space-y-2 text-sm text-ink-muted">
            <li className="flex items-start gap-2">
              <Badge tone="easy">OK</Badge>
              <span>Drafts, diagrams and notes live in this device&apos;s IndexedDB and sync to your private Supabase rows.</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge tone="easy">OK</Badge>
              <span>Row Level Security means only you can read your code, diagrams and notes.</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge tone="easy">OK</Badge>
              <span>We never ask for or store LeetCode credentials.</span>
            </li>
          </ul>
        </Card>

        <SignOutButton />
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  );
}

function StatusRow({ label, ready }: { label: string; ready: boolean }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <Badge tone={ready ? 'easy' : 'neutral'}>{ready ? 'Configured' : 'Not configured'}</Badge>
    </li>
  );
}

function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="min-h-12 w-full rounded-xl border border-line bg-surface-2 text-sm font-medium"
      >
        Sign out
      </button>
    </form>
  );
}