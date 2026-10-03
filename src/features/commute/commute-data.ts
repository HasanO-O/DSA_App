import { loadBrowserData } from '@/features/problems/browser-data';
import { loadProgressMap } from '@/features/progress/progress-service';
import { SOLVED_STATUSES } from '@/types/progress';

/**
 * Deterministic problem selection for a commute session (spec §19).
 *
 * Ordering rule, in priority order:
 *  1. Problems explicitly marked Needs Review.
 *  2. Attempted but unsolved problems (finish what you started).
 *  3. The next unsolved problem on the NeetCode roadmap.
 *
 * No AI is involved — the same state always yields the same list.
 */
export async function loadRoadmapForCommute(count = 3) {
  const [data, progress] = await Promise.all([loadBrowserData(), loadProgressMap()]);
  const all = data.sections.flatMap((section) => section.problems);

  const needsReview = all.filter((p) => p.needsReview);
  const inProgress = all.filter(
    (p) => !p.needsReview && p.learningStatus === 'ATTEMPTED',
  );
  const fresh = all.filter((p) => {
    const status = progress[p.id]?.learningStatus ?? p.learningStatus;
    return status === 'NOT_STARTED';
  });
  const toReview = all.filter((p) => {
    const status = progress[p.id]?.learningStatus ?? p.learningStatus;
    return SOLVED_STATUSES.includes(status);
  });

  const picked = [...needsReview, ...inProgress, ...fresh, ...toReview].slice(0, count);

  return {
    recommended: picked,
    totalSolved: all.filter((p) => SOLVED_STATUSES.includes(p.learningStatus)).length,
  };
}