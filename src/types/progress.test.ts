import { describe, expect, it } from 'vitest';
import { deriveLearningStatus, shouldQueueReview, REVIEW_RULES } from '@/types/progress';

const base = {
  current: 'NOT_STARTED' as const,
  solved: false,
  usedHints: false,
  failedAttempts: 0,
  explicitlyNeedsReview: false,
};

describe('deriveLearningStatus', () => {
  it('marks an unsolved attempt as ATTEMPTED', () => {
    expect(deriveLearningStatus(base)).toBe('ATTEMPTED');
  });

  it('marks a clean solve as SOLVED', () => {
    expect(deriveLearningStatus({ ...base, solved: true })).toBe('SOLVED');
  });

  it('downgrades a hinted solve to SOLVED_WITH_HINT', () => {
    expect(deriveLearningStatus({ ...base, solved: true, usedHints: true })).toBe('SOLVED_WITH_HINT');
  });

  it('downgrades a solve that followed failures to SOLVED_WITH_HINT', () => {
    expect(deriveLearningStatus({ ...base, solved: true, failedAttempts: 2 })).toBe('SOLVED_WITH_HINT');
  });

  it('honours an explicit review request', () => {
    expect(deriveLearningStatus({ ...base, explicitlyNeedsReview: true })).toBe('NEEDS_REVIEW');
  });

  it('keeps NEEDS_REVIEW sticky until a solve happens', () => {
    expect(deriveLearningStatus({ ...base, current: 'NEEDS_REVIEW' })).toBe('NEEDS_REVIEW');
  });

  it('promotes a clean re-solve of a hinted problem to MASTERED', () => {
    expect(
      deriveLearningStatus({ ...base, current: 'SOLVED_WITH_HINT', solved: true, reviewedCleanly: true }),
    ).toBe('MASTERED');
  });

  it('does not promote a problem that was never solved', () => {
    expect(deriveLearningStatus({ ...base, reviewedCleanly: true })).toBe('ATTEMPTED');
  });
});

describe('shouldQueueReview', () => {
  it('returns null for a clean first solve', () => {
    expect(shouldQueueReview({ solved: true, hintsUsed: 0, attemptCount: 1, successfulSubmissionCount: 1 })).toBeNull();
  });

  it('queues a solve that used hints', () => {
    expect(shouldQueueReview({ solved: true, hintsUsed: 2, attemptCount: 3, successfulSubmissionCount: 1 })).toBe(
      REVIEW_RULES.SOLVED_WITH_HINT,
    );
  });

  it('queues a solve that followed two or more failures', () => {
    expect(shouldQueueReview({ solved: true, hintsUsed: 0, attemptCount: 3, successfulSubmissionCount: 1 })).toBe(
      REVIEW_RULES.MULTIPLE_FAILURES,
    );
  });

  it('does not queue an unsolved problem', () => {
    expect(shouldQueueReview({ solved: false, hintsUsed: 0, attemptCount: 5, successfulSubmissionCount: 0 })).toBeNull();
  });

  it('does not queue a problem with no attempts', () => {
    expect(shouldQueueReview({ solved: true, hintsUsed: 0, attemptCount: 0, successfulSubmissionCount: 0 })).toBeNull();
  });
});