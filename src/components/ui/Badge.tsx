import { cn } from '@/utils/cn';
import type { Difficulty } from '@/types/problem';
import { formatDifficulty } from '@/utils/format';

type BadgeTone = 'neutral' | 'easy' | 'medium' | 'hard' | 'brand' | 'review';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-ink-muted',
  easy: 'bg-easy/12 text-easy',
  medium: 'bg-medium/15 text-medium',
  hard: 'bg-hard/12 text-hard',
  brand: 'bg-brand-soft text-brand',
  review: 'bg-review/12 text-review',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const difficultyTone: Record<Difficulty, BadgeTone> = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge tone={difficultyTone[difficulty]}>{formatDifficulty(difficulty)}</Badge>;
}