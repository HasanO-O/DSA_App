import { cn } from '@/utils/cn';

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span
      role="status"
      aria-label={label ?? 'Loading'}
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand',
        className,
      )}
    />
  );
}