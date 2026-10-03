'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { LearningStatus, ProblemProgress } from '@/types/progress';
import { EMPTY_PROGRESS } from '@/lib/problems/seed';

interface ProgressRow {
  problem_id: string;
  learning_status: LearningStatus;
  attempt_count: number;
  successful_submission_count: number;
  hints_used: number;
  time_spent: number;
  last_attempted_at: string | null;
  last_solved_at: string | null;
  last_reviewed_at: string | null;
  external_status: ProblemProgress['externalStatus'];
  updated_at: string;
}

export type ProgressMap = Record<string, ProblemProgress>;

/**
 * Reads the signed-in user's progress. Returns an empty map when Supabase is
 * unavailable or the table is not yet seeded, so the dashboard degrades to a
 * "nothing solved yet" state rather than erroring.
 */
export async function loadProgressMap(): Promise<ProgressMap> {
  const { client, missingConfig } = await createServerSupabaseClient();
  if (missingConfig || !client) return {};

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return {};

  const { data, error } = await client
    .from('problem_progress')
    .select(
      'problem_id, learning_status, attempt_count, successful_submission_count, hints_used, time_spent, last_attempted_at, last_solved_at, last_reviewed_at, external_status, updated_at',
    )
    .eq('user_id', user.id);

  if (error || !data) return {};

  const map: ProgressMap = {};
  for (const row of data as unknown as ProgressRow[]) {
    map[row.problem_id] = {
      userId: user.id,
      problemId: row.problem_id,
      learningStatus: row.learning_status ?? EMPTY_PROGRESS,
      attemptCount: row.attempt_count ?? 0,
      successfulSubmissionCount: row.successful_submission_count ?? 0,
      hintsUsed: row.hints_used ?? 0,
      timeSpent: row.time_spent ?? 0,
      lastAttemptedAt: row.last_attempted_at,
      lastSolvedAt: row.last_solved_at,
      lastReviewedAt: row.last_reviewed_at,
      externalStatus: row.external_status ?? 'UNKNOWN',
      updatedAt: row.updated_at,
    };
  }
  return map;
}

export async function loadReviewQueue(): Promise<{ problemId: string; reason: string }[]> {
  const { client, missingConfig } = await createServerSupabaseClient();
  if (missingConfig || !client) return [];

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return [];

  const { data } = await client
    .from('review_items')
    .select('problem_id, reason')
    .eq('user_id', user.id)
    .is('resolved_at', null);

  return (data ?? []).map((row) => ({ problemId: row.problem_id, reason: row.reason ?? '' }));
}

/** Writes progress server-side. Never trusts a client-supplied user id. */
const progressUpdateSchema = z.object({
  problemId: z.string().min(1),
  learningStatus: z.enum([
    'NOT_STARTED',
    'ATTEMPTED',
    'SOLVED',
    'SOLVED_WITH_HINT',
    'NEEDS_REVIEW',
    'MASTERED',
  ]),
  incrementAttempts: z.number().int().min(0).max(1).default(0),
  incrementSuccesses: z.number().int().min(0).max(1).default(0),
  incrementHints: z.number().int().min(0).default(0),
  incrementTimeSpent: z.number().int().min(0).default(0),
});

export async function saveProgress(input: z.input<typeof progressUpdateSchema>): Promise<boolean> {
  const parsed = progressUpdateSchema.safeParse(input);
  if (!parsed.success) return false;

  const { client, missingConfig } = await createServerSupabaseClient();
  if (missingConfig || !client) return false;

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return false;

  const now = new Date().toISOString();
  const { data: existing } = await client
    .from('problem_progress')
    .select('id, attempt_count, successful_submission_count, hints_used, time_spent')
    .eq('user_id', user.id)
    .eq('problem_id', parsed.data.problemId)
    .maybeSingle();

  const base = {
    learning_status: parsed.data.learningStatus,
    updated_at: now,
    last_attempted_at: now,
    last_solved_at:
      parsed.data.learningStatus === 'SOLVED' ||
      parsed.data.learningStatus === 'SOLVED_WITH_HINT' ||
      parsed.data.learningStatus === 'MASTERED'
        ? now
        : null,
  };

  if (!existing) {
    const { error } = await client.from('problem_progress').insert({
      user_id: user.id,
      problem_id: parsed.data.problemId,
      learning_status: base.learning_status,
      attempt_count: parsed.data.incrementAttempts,
      successful_submission_count: parsed.data.incrementSuccesses,
      hints_used: parsed.data.incrementHints,
      time_spent: parsed.data.incrementTimeSpent,
      last_attempted_at: base.last_attempted_at,
      last_solved_at: base.last_solved_at,
    });
    return !error;
  }

  const { error } = await client
    .from('problem_progress')
    .update({
      learning_status: base.learning_status,
      attempt_count: existing.attempt_count + parsed.data.incrementAttempts,
      successful_submission_count:
        existing.successful_submission_count + parsed.data.incrementSuccesses,
      hints_used: existing.hints_used + parsed.data.incrementHints,
      time_spent: existing.time_spent + parsed.data.incrementTimeSpent,
      last_attempted_at: base.last_attempted_at,
      last_solved_at: base.last_solved_at ?? undefined,
      updated_at: base.updated_at,
    })
    .eq('id', existing.id);

  return !error;
}