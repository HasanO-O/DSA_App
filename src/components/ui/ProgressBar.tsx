import { cn } from '@/utils/cn';

export function ProgressBar({
  value,
  max,
  tone = 'brand',
  className,
  label,
}: {
  value: number;
  max: number;
  tone?: 'brand' | 'easy' | 'review';
  className?: string;
  label?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const tones = { brand: 'bg-brand', easy: 'bg-easy', review: 'bg-review' };
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-2', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-300', tones[tone])}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}