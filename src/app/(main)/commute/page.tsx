import type { Metadata } from 'next';
import { Shell } from '@/components/layout/Shell';
import { Card, SectionHeading } from '@/components/ui/Card';
import { loadRoadmapForCommute } from '@/features/commute/commute-data';

export const metadata: Metadata = { title: 'Commute' };

const DURATIONS = [15, 30, 45, 60, 90] as const;

/**
 * Commute mode entry point (spec §19). Session tracking and the summary screen
 * land in Phase 8; this is the selection surface plus a preview of what would be
 * recommended for the chosen duration.
 */
export default async function CommutePage() {
  const { recommended } = await loadRoadmapForCommute();

  return (
    <Shell title="Commute mode" withNav={false}>
      <div className="space-y-6">
        <section>
          <SectionHeading title="How long is your journey?" />
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className="min-h-16 rounded-2xl border border-line bg-surface text-center active:bg-surface-2"
              >
                <span className="block text-lg font-semibold">{minutes}</span>
                <span className="block text-xs text-ink-muted">minutes</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="What you could cover" />
          <Card>
            <p className="text-sm text-ink-muted">
              A 30-minute session typically fits 2–3 problems. Session tracking, the timer and the
              end-of-session summary arrive in Phase 8 — the recommendation logic behind this
              preview is already deterministic.
            </p>
          </Card>
        </section>

        <section>
          <SectionHeading title="Suggested for a 30-minute session" />
          <ul className="space-y-2">
            {recommended.map((problem) => (
              <li
                key={problem.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{problem.title}</span>
                  <span className="block truncate text-xs text-ink-muted">
                    {problem.category} · {problem.difficulty}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}