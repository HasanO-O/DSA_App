import type { Difficulty } from '@/types/problem';
import type { LearningStatus } from '@/types/progress';

const MINUTE = 60;
const HOUR = 60 * MINUTE;

/** "2h 15m" / "45m" / "30s" — compact enough for a narrow mobile row. */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0m';
  const seconds = Math.floor(totalSeconds);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / MINUTE);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

export function formatRelativeTime(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return 'never';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 'never';
  const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSeconds < 60) return 'just now';
  const minutes = Math.floor(diffSeconds / MINUTE);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(then).toLocaleDateString();
}

const difficultyLabel: Record<Difficulty, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export function formatDifficulty(difficulty: Difficulty): string {
  return difficultyLabel[difficulty];
}

export function percent(solved: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((solved / total) * 100);
}

export const statusGlyph: Record<LearningStatus, string> = {
  NOT_STARTED: '○',
  ATTEMPTED: '◐',
  SOLVED: '✓',
  SOLVED_WITH_HINT: '✓',
  NEEDS_REVIEW: '↻',
  MASTERED: '★',
};

export function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}