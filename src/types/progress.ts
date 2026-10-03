export const LEARNING_STATUSES = [
  'NOT_STARTED',
  'ATTEMPTED',
  'SOLVED',
  'SOLVED_WITH_HINT',
  'NEEDS_REVIEW',
  'MASTERED',
] as const;

export type LearningStatus = (typeof LEARNING_STATUSES)[number];

/** External platform state. Deliberately separate from internal learning status. */
export const EXTERNAL_STATUSES = ['UNKNOWN', 'UNSOLVED', 'ATTEMPTED', 'SOLVED', 'ACCEPTED'] as const;
export type ExternalStatus = (typeof EXTERNAL_STATUSES)[number];

export interface ProblemProgress {
  userId: string;
  problemId: string;
  learningStatus: LearningStatus;
  attemptCount: number;
  successfulSubmissionCount: number;
  hintsUsed: number;
  /** Total focused seconds spent on this problem. */
  timeSpent: number;
  lastAttemptedAt: string | null;
  lastSolvedAt: string | null;
  lastReviewedAt: string | null;
  externalStatus: ExternalStatus;
  updatedAt: string;
}

export const learningStatusLabels: Record<LearningStatus, string> = {
  NOT_STARTED: 'Not started',
  ATTEMPTED: 'Attempted',
  SOLVED: 'Solved',
  SOLVED_WITH_HINT: 'Solved with hint',
  NEEDS_REVIEW: 'Needs review',
  MASTERED: 'Mastered',
};

/**
 * Statuses that count as "the learner has produced a working solution", used by
 * the recommendation engine and dashboard counts.
 */
export const SOLVED_STATUSES: LearningStatus[] = ['SOLVED', 'SOLVED_WITH_HINT', 'MASTERED'];

/**
 * Deterministic learning-status transitions. Kept as a pure function so it is
 * unit-testable and reusable by the sync layer and the API route.
 */
export function deriveLearningStatus(params: {
  current: LearningStatus;
  solved: boolean;
  usedHints: boolean;
  failedAttempts: number;
  explicitlyNeedsReview: boolean;
  reviewedCleanly?: boolean;
}): LearningStatus {
  const { current, solved, usedHints, failedAttempts, explicitlyNeedsReview, reviewedCleanly } =
    params;

  if (reviewedCleanly && (current === 'SOLVED' || current === 'SOLVED_WITH_HINT')) return 'MASTERED';

  if (solved) {
    if (usedHints || failedAttempts > 0) return 'SOLVED_WITH_HINT';
    return current === 'MASTERED' ? 'MASTERED' : 'SOLVED';
  }

  if (explicitlyNeedsReview) return 'NEEDS_REVIEW';
  if (current === 'NEEDS_REVIEW') return 'NEEDS_REVIEW';
  return 'ATTEMPTED';
}

export interface ReviewItem {
  id: string;
  userId: string;
  problemId: string;
  reason: string;
  createdAt: string;
  resolvedAt: string | null;
}

/** V1 deterministic review triggers (spec §17). */
export const REVIEW_RULES = {
  EXPLICIT: 'explicitly marked for review',
  SOLVED_WITH_HINT: 'solved with significant help',
  MULTIPLE_FAILURES: 'multiple failed attempts',
  AI_FLAG: 'AI flagged a gap during review',
} as const;

export function shouldQueueReview(input: {
  solved: boolean;
  hintsUsed: number;
  attemptCount: number;
  successfulSubmissionCount: number;
}): string | null {
  const failedAttempts = input.attemptCount - input.successfulSubmissionCount;
  if (!input.solved && input.attemptCount > 0) return null;
  if (input.hintsUsed > 0) return REVIEW_RULES.SOLVED_WITH_HINT;
  if (failedAttempts >= 2) return REVIEW_RULES.MULTIPLE_FAILURES;
  return null;
}